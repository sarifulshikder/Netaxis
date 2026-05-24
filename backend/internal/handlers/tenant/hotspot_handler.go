package tenant

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type HotspotHandler struct {
	svc *services.HotspotService
}

// Placeholder for authentication/authorization middleware.
// Replace with real implementation.
func requireAuth(c *gin.Context) bool {
	// Example: check for Authorization header
	auth := c.GetHeader("Authorization")
	if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
		return false
	}
	// TODO: Validate token, check permissions, etc.
	return true
}

func NewHotspotHandler(svc *services.HotspotService) *HotspotHandler {
	return &HotspotHandler{svc: svc}
}

func (h *HotspotHandler) ListProfiles(c *gin.Context) {
	if !requireAuth(c) {
		return
	}
	res, err := h.svc.ListProfiles()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list profiles", err.Error())
		return
	}
	utils.Success(c, "Profiles listed", res)
}

func (h *HotspotHandler) CreateProfile(c *gin.Context) {
	if !requireAuth(c) {
		return
	}
	var data tenant.HotspotProfile
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	// Basic validation
	if strings.TrimSpace(data.Name) == "" || data.Price < 0 || data.ValidityMinutes <= 0 {
		utils.Error(c, http.StatusBadRequest, "Invalid profile data", nil)
		return
	}
	res, err := h.svc.CreateProfile(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create profile", err.Error())
		return
	}
	utils.Success(c, "Profile created", res)
}

func (h *HotspotHandler) UpdateProfile(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "Update profile not implemented", nil)
}

func (h *HotspotHandler) DeleteProfile(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "Delete profile not implemented", nil)
}

func (h *HotspotHandler) GenerateVouchers(c *gin.Context) {
	if !requireAuth(c) {
		return
	}
	var req struct {
		ProfileID string `json:"profile_id" binding:"required"`
		Quantity  int    `json:"quantity" binding:"required"`
		BatchName string `json:"batch_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if req.ProfileID == "" || req.Quantity <= 0 || req.Quantity > 1000 {
		utils.Error(c, http.StatusBadRequest, "Invalid voucher generation parameters", nil)
		return
	}
	res, err := h.svc.GenerateVouchers(req.ProfileID, req.Quantity, req.BatchName)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to generate vouchers", err.Error())
		return
	}
	utils.Success(c, "Vouchers generated", res)
}

func (h *HotspotHandler) ListVouchers(c *gin.Context) {
	if !requireAuth(c) {
		return
	}
	batch := c.Query("batch")
	res, err := h.svc.ListVouchers(batch)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list vouchers", err.Error())
		return
	}
	utils.Success(c, "Vouchers listed", res)
}

func (h *HotspotHandler) PrintVouchers(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "Print vouchers not implemented", nil)
}

func (h *HotspotHandler) ListSessions(c *gin.Context) {
	if !requireAuth(c) {
		return
	}
	res, err := h.svc.ListSessions()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list sessions", err.Error())
		return
	}
	utils.Success(c, "Sessions listed", res)
}

func (h *HotspotHandler) ListUsers(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "List users not implemented", nil)
}

func (h *HotspotHandler) CreateUser(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "Create user not implemented", nil)
}
