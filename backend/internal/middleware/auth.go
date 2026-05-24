package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/netaxis/backend/internal/utils"
)

type Claims struct {
	UserID   string `json:"user_id"`
	TenantID string `json:"tenant_id"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Error(c, http.StatusUnauthorized, "Authorization header required", nil)
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			utils.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil || token == nil || !token.Valid {
			utils.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
			c.Abort()
			return
		}

		// Check token expiration explicitly
		if claims.ExpiresAt != nil && claims.ExpiresAt.Time.Before(time.Now()) {
			utils.Error(c, http.StatusUnauthorized, "Token expired", nil)
			c.Abort()
			return
		}

		// Validate claims fields
		if claims.UserID == "" || claims.TenantID == "" || claims.Role == "" {
			utils.Error(c, http.StatusUnauthorized, "Invalid token claims", nil)
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("tenant_id", claims.TenantID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			utils.Error(c, http.StatusForbidden, "Role not found in context", nil)
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			utils.Error(c, http.StatusForbidden, "Forbidden", nil)
			c.Abort()
			return
		}
		allowed := false
		for _, r := range roles {
			if strings.EqualFold(r, roleStr) {
				allowed = true
				break
			}
		}

		if !allowed {
			utils.Error(c, http.StatusForbidden, "Forbidden", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}

func GetUserID(c *gin.Context) string {
	val, _ := c.Get("user_id")
	if s, ok := val.(string); ok {
		return s
	}
	return ""
}

func GetTenantID(c *gin.Context) string {
	val, _ := c.Get("tenant_id")
	if s, ok := val.(string); ok {
		return s
	}
	return ""
}

func GetRole(c *gin.Context) string {
	val, _ := c.Get("role")
	if s, ok := val.(string); ok {
		return s
	}
	return ""
}
