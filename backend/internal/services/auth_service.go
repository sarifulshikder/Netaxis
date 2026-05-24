package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/netaxis/backend/internal/database"
	"github.com/netaxis/backend/internal/models/public"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/utils"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type AuthService struct {
	db        *gorm.DB
	rdb       *redis.Client
	jwtSecret string
}

func NewAuthService(db *gorm.DB, rdb *redis.Client, jwtSecret string) *AuthService {
	return &AuthService{db: db, rdb: rdb, jwtSecret: jwtSecret}
}

type LoginResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         interface{} `json:"user"`
}

func (s *AuthService) SuperAdminLogin(email, password string) (*LoginResponse, error) {
	var user public.SuperAdminUser
	err := s.db.Raw("SELECT * FROM super_admin_users WHERE email = ? AND password = crypt(?, password)", email, password).Scan(&user).Error
	if err != nil || user.Email == "" {
		return nil, errors.New("invalid email or password")
	}
	return s.generateLoginResponse(user.ID.String(), "", "superadmin", user)
}

func (s *AuthService) StaffLogin(slug, email, password string) (*LoginResponse, error) {
	// 1. Resolve slug to schema_name
	var t public.Tenant
	if err := s.db.Where("slug = ?", slug).First(&t).Error; err != nil {
		return nil, errors.New("invalid workspace ID")
	}

	tenantDB := database.GetTenantDB(s.db, t.SchemaName)

	// 2. Find staff
	var staff tenant.Staff
	if err := tenantDB.Where("email = ? AND is_active = ?", email, true).First(&staff).Error; err != nil {
		return nil, errors.New("staff not found or inactive")
	}

	// 3. Find auth record using raw SQL to avoid schema issues
	var auth tenant.StaffAuth
	rawSQL := fmt.Sprintf(`SELECT * FROM "%s"."staff_auth" WHERE staff_id = ? LIMIT 1`, t.SchemaName)
	if err := s.db.Raw(rawSQL, staff.ID).Scan(&auth).Error; err != nil || auth.ID == (auth.ID) && auth.Password == "" {
		return nil, errors.New("auth record not found")
	}

	// 4. Check password
	if !utils.CheckPasswordHash(password, auth.Password) {
		return nil, errors.New("invalid password")
	}

	return s.generateLoginResponse(staff.ID.String(), t.ID.String(), staff.Role, staff)
}

func (s *AuthService) generateLoginResponse(userID, tenantID, role string, user interface{}) (*LoginResponse, error) {
	accessToken, err := s.GenerateToken(userID, tenantID, role, 15*time.Minute)
	if err != nil {
		return nil, err
	}
	refreshToken, err := s.GenerateToken(userID, tenantID, role, 7*24*time.Hour)
	if err != nil {
		return nil, err
	}
	s.rdb.Set(context.Background(), "refresh_token:"+userID, refreshToken, 7*24*time.Hour)
	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}, nil
}

func (s *AuthService) GenerateToken(userID, tenantID, role string, duration time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"user_id":   userID,
		"tenant_id": tenantID,
		"role":      role,
		"exp":       time.Now().Add(duration).Unix(),
		"iat":       time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) RefreshToken(tokenStr string) (string, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("invalid refresh token")
	}
	claims := token.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(string)
	tenantID := claims["tenant_id"].(string)
	role := claims["role"].(string)
	val, err := s.rdb.Get(context.Background(), "refresh_token:"+userID).Result()
	if err != nil || val != tokenStr {
		return "", errors.New("refresh token expired or revoked")
	}
	return s.GenerateToken(userID, tenantID, role, 15*time.Minute)
}
