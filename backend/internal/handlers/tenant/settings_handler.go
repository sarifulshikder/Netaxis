package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type SettingsHandler struct {
	svc *services.SettingsService
}

func NewSettingsHandler(svc *services.SettingsService) *SettingsHandler {
	return &SettingsHandler{svc: svc}
}

func (h *SettingsHandler) GetAll(c *gin.Context) {
	res, err := h.svc.GetAll()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch settings", err.Error())
		return
	}
	utils.Success(c, "Settings fetched", res)
}

func (h *SettingsHandler) UpdateBulk(c *gin.Context) {
	var data map[string]string
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if err := h.svc.UpdateBulk(data); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update settings", err.Error())
		return
	}
	utils.Success(c, "Settings updated", nil)
}

func (h *SettingsHandler) Update(c *gin.Context) {
	key := c.Param("key")
	var req struct {
		Value string `json:"value" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if err := h.svc.Update(key, req.Value); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update setting", err.Error())
		return
	}
	utils.Success(c, "Setting updated", nil)
}
