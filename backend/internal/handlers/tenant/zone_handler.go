package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type ZoneHandler struct {
	svc *services.ZoneService
}

func NewZoneHandler(svc *services.ZoneService) *ZoneHandler {
	if svc == nil {
		panic("ZoneService cannot be nil")
	}
	return &ZoneHandler{svc: svc}
}

func (h *ZoneHandler) List(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	res, err := h.svc.ListZones()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list zones", nil)
		return
	}
	utils.Success(c, "Zones listed", res)
}

func (h *ZoneHandler) Create(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	var data tenant.Zone
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}
	if data.Name == "" {
		utils.Error(c, http.StatusBadRequest, "Zone name is required", nil)
		return
	}
	res, err := h.svc.CreateZone(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create zone", nil)
		return
	}
	utils.Success(c, "Zone created", res)
}

func (h *ZoneHandler) Get(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Missing zone ID", nil)
		return
	}
	if _, err := uuid.Parse(id); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid zone ID", nil)
		return
	}
	res, err := h.svc.GetZone(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Zone not found", nil)
		return
	}
	utils.Success(c, "Zone fetched", res)
}

func (h *ZoneHandler) Update(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Missing zone ID", nil)
		return
	}
	if _, err := uuid.Parse(id); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid zone ID", nil)
		return
	}
	var data tenant.Zone
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}
	if data.Name == "" {
		utils.Error(c, http.StatusBadRequest, "Zone name is required", nil)
		return
	}
	res, err := h.svc.UpdateZone(id, data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update zone", nil)
		return
	}
	utils.Success(c, "Zone updated", res)
}

func (h *ZoneHandler) Delete(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Missing zone ID", nil)
		return
	}
	if _, err := uuid.Parse(id); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid zone ID", nil)
		return
	}
	if err := h.svc.DeleteZone(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to delete zone", nil)
		return
	}
	utils.Success(c, "Zone deleted", nil)
}
