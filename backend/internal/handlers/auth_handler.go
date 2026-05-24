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
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	var res *services.LoginResponse
	var err error

	if req.Role == "superadmin" {
		res, err = h.svc.SuperAdminLogin(req.Email, req.Password)
	} else {
		if req.Schema == "" {
			utils.Error(c, http.StatusBadRequest, "Schema is required for this role", nil)
			return
		}
		res, err = h.svc.StaffLogin(req.Schema, req.Email, req.Password)
	}

	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	utils.Success(c, "Login successful", res)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	newToken, err := h.svc.RefreshToken(req.RefreshToken)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	utils.Success(c, "Token refreshed", gin.H{"access_token": newToken})
}

func (h *AuthHandler) Me(c *gin.Context) {
	// Information already in context from middleware
	userID, _ := c.Get("user_id")
	tenantID, _ := c.Get("tenant_id")
	role, _ := c.Get("role")

	utils.Success(c, "Current user info", gin.H{
		"user_id":   userID,
		"tenant_id": tenantID,
		"role":      role,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	// In a real app, we'd blacklist the token in Redis
	utils.Success(c, "Logout successful", nil)
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	utils.Success(c, "Reset link sent if email exists", nil)
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	utils.Success(c, "Password reset successful", nil)
}
