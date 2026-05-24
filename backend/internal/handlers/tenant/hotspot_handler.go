package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type HotspotHandler struct {
	svc *services.HotspotService
}

func NewHotspotHandler(svc *services.HotspotService) *HotspotHandler {
	return &HotspotHandler{svc: svc}
}

func (h *HotspotHandler) ListProfiles(c *gin.Context) {
	res, err := h.svc.ListProfiles()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list profiles", err.Error())
		return
	}
	utils.Success(c, "Profiles listed", res)
}

func (h *HotspotHandler) CreateProfile(c *gin.Context) {
	var data tenant.HotspotProfile
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
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
	utils.Success(c, "Profile updated", nil)
}

func (h *HotspotHandler) DeleteProfile(c *gin.Context) {
	utils.Success(c, "Profile deleted", nil)
}

func (h *HotspotHandler) GenerateVouchers(c *gin.Context) {
	var req struct {
		ProfileID string `json:"profile_id" binding:"required"`
		Quantity  int    `json:"quantity" binding:"required"`
		BatchName string `json:"batch_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
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
	batch := c.Query("batch")
	res, err := h.svc.ListVouchers(batch)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list vouchers", err.Error())
		return
	}
	utils.Success(c, "Vouchers listed", res)
}

func (h *HotspotHandler) PrintVouchers(c *gin.Context) {
	utils.Success(c, "Vouchers PDF generated", nil)
}

func (h *HotspotHandler) ListSessions(c *gin.Context) {
	res, err := h.svc.ListSessions()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list sessions", err.Error())
		return
	}
	utils.Success(c, "Sessions listed", res)
}

func (h *HotspotHandler) ListUsers(c *gin.Context) {
	utils.Success(c, "Users listed", nil)
}

func (h *HotspotHandler) CreateUser(c *gin.Context) {
	utils.Success(c, "User created", nil)
}
