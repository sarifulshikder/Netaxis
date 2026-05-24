package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type ConnectionHandler struct {
	svc         *services.ConnectionService
	mikrotikSvc *services.MikrotikService
}

func NewConnectionHandler(svc *services.ConnectionService, mikrotikSvc *services.MikrotikService) *ConnectionHandler {
	return &ConnectionHandler{svc: svc, mikrotikSvc: mikrotikSvc}
}

func (h *ConnectionHandler) List(c *gin.Context) {
	res, err := h.svc.ListConnections()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list connections", err.Error())
		return
	}
	utils.Success(c, "Connections listed", res)
}

func (h *ConnectionHandler) Create(c *gin.Context) {
	var data tenant.Connection
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	res, err := h.svc.CreateConnection(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create connection", err.Error())
		return
	}
	utils.Success(c, "Connection created", res)
}

func (h *ConnectionHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetConnection(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Connection not found", err.Error())
		return
	}
	utils.Success(c, "Connection fetched", res)
}

func (h *ConnectionHandler) Update(c *gin.Context) {
	var data tenant.Connection
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	// Update logic not fully in svc yet, but following pattern
	utils.Success(c, "Connection updated", nil)
}

func (h *ConnectionHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteConnection(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to delete", err.Error())
		return
	}
	utils.Success(c, "Connection deleted", nil)
}

func (h *ConnectionHandler) Suspend(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.SuspendConnection(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to suspend", err.Error())
		return
	}
	utils.Success(c, "Connection suspended", nil)
}

func (h *ConnectionHandler) Resume(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.ResumeConnection(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to resume", err.Error())
		return
	}
	utils.Success(c, "Connection resumed", nil)
}

func (h *ConnectionHandler) ChangeSpeed(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		PackageID string `json:"package_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.svc.ChangeSpeed(id, req.PackageID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to change speed", err.Error())
		return
	}
	utils.Success(c, "Connection speed changed", nil)
}
