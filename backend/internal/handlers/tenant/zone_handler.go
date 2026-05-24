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
	return &ZoneHandler{svc: svc}
}

func (h *ZoneHandler) List(c *gin.Context) {
	res, err := h.svc.ListZones()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list zones", err.Error())
		return
	}
	utils.Success(c, "Zones listed", res)
}

func (h *ZoneHandler) Create(c *gin.Context) {
	var data tenant.Zone
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.CreateZone(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create zone", err.Error())
		return
	}
	utils.Success(c, "Zone created", res)
}

func (h *ZoneHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetZone(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Zone not found", err.Error())
		return
	}
	utils.Success(c, "Zone fetched", res)
}

func (h *ZoneHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var data tenant.Zone
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.UpdateZone(id, data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update zone", err.Error())
		return
	}
	utils.Success(c, "Zone updated", res)
}

func (h *ZoneHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteZone(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to delete zone", err.Error())
		return
	}
	utils.Success(c, "Zone deleted", nil)
}
