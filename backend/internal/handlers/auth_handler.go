package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type AuthHandler struct {
	svc *services.AuthService
}

func NewAuthHandler(svc *services.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"` // superadmin, staff, customer, reseller
	Schema   string `json:"schema"`                   // Required for non-superadmin
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}

	// Rate limiting and brute-force protection should be implemented here (TODO)

	var res *services.LoginResponse
	var err error

	switch req.Role {
	case "superadmin":
		res, err = h.svc.SuperAdminLogin(req.Email, req.Password)
	case "staff":
		if req.Schema == "" {
			utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
			return
		}
		res, err = h.svc.StaffLogin(req.Schema, req.Email, req.Password)
	// Add other roles as needed (customer, reseller)
	default:
		utils.Error(c, http.StatusBadRequest, "Invalid role", nil)
		return
	}

	if err != nil {
		// Generic error message to avoid leaking info
		utils.Error(c, http.StatusUnauthorized, "Invalid credentials", nil)
		return
	}

	utils.Success(c, "Login successful", res)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}

	newToken, err := h.svc.RefreshToken(req.RefreshToken)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "Invalid credentials", nil)
		return
	}

	utils.Success(c, "Token refreshed", gin.H{"access_token": newToken})
}

func (h *AuthHandler) Me(c *gin.Context) {
	// Information already in context from middleware
	userID, ok1 := c.Get("user_id")
	tenantID, ok2 := c.Get("tenant_id")
	role, ok3 := c.Get("role")

	if !ok1 || !ok2 || !ok3 {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	uid, _ := userID.(string)
	tid, _ := tenantID.(string)
	r, _ := role.(string)

	utils.Success(c, "Current user info", gin.H{
		"user_id":   uid,
		"tenant_id": tid,
		"role":      r,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	// In a real app, we'd blacklist the token in Redis or invalidate it (TODO)
	utils.Success(c, "Logout successful", nil)
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	// TODO: Implement secure password reset logic with rate limiting and email verification
	utils.Success(c, "Reset link sent if email exists", nil)
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	// TODO: Implement secure password reset logic with token validation
	utils.Success(c, "Password reset successful", nil)
}
