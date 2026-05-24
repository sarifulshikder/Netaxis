package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

// Add IsValidUUID utility function if not present in utils
// func IsValidUUID(u string) bool { ... }

type ConnectionHandler struct {
	svc         *services.ConnectionService
	mikrotikSvc *services.MikrotikService
}

func NewConnectionHandler(svc *services.ConnectionService, mikrotikSvc *services.MikrotikService) *ConnectionHandler {
	return &ConnectionHandler{svc: svc, mikrotikSvc: mikrotikSvc}
}

func (h *ConnectionHandler) List(c *gin.Context) {
	// TODO: Add authentication/authorization check
	// Example: if !utils.IsAuthorized(c) { utils.Error(c, http.StatusUnauthorized, "Unauthorized", nil); return }

	res, err := h.svc.ListConnections()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list connections", nil)
		return
	}
	utils.Success(c, "Connections listed", res)
}

func (h *ConnectionHandler) Create(c *gin.Context) {
	// TODO: Add authentication/authorization check

	var data tenant.Connection
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}

	res, err := h.svc.CreateConnection(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create connection", nil)
		return
	}
	utils.Success(c, "Connection created", res)
}

func (h *ConnectionHandler) Get(c *gin.Context) {
	// TODO: Add authentication/authorization check

	id := c.Param("id")
	if !utils.IsValidUUID(id) {
		utils.Error(c, http.StatusBadRequest, "Invalid connection ID", nil)
		return
	}
	res, err := h.svc.GetConnection(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Connection not found", nil)
		return
	}
	utils.Success(c, "Connection fetched", res)
}

func (h *ConnectionHandler) Update(c *gin.Context) {
	// TODO: Add authentication/authorization check

	var data tenant.Connection
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}

	// Update logic not fully in svc yet, so return error for now
	utils.Error(c, http.StatusNotImplemented, "Update not implemented", nil)
}

func (h *ConnectionHandler) Delete(c *gin.Context) {
	// TODO: Add authentication/authorization check

	id := c.Param("id")
	if !utils.IsValidUUID(id) {
		utils.Error(c, http.StatusBadRequest, "Invalid connection ID", nil)
		return
	}
	if err := h.svc.DeleteConnection(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to delete", nil)
		return
	}
	utils.Success(c, "Connection deleted", nil)
}

func (h *ConnectionHandler) Suspend(c *gin.Context) {
	// TODO: Add authentication/authorization check

	id := c.Param("id")
	if !utils.IsValidUUID(id) {
		utils.Error(c, http.StatusBadRequest, "Invalid connection ID", nil)
		return
	}
	if err := h.svc.SuspendConnection(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to suspend", nil)
		return
	}
	utils.Success(c, "Connection suspended", nil)
}

func (h *ConnectionHandler) Resume(c *gin.Context) {
	// TODO: Add authentication/authorization check

	id := c.Param("id")
	if !utils.IsValidUUID(id) {
		utils.Error(c, http.StatusBadRequest, "Invalid connection ID", nil)
		return
	}
	if err := h.svc.ResumeConnection(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to resume", nil)
		return
	}
	utils.Success(c, "Connection resumed", nil)
}

func (h *ConnectionHandler) ChangeSpeed(c *gin.Context) {
	// TODO: Add authentication/authorization check

	id := c.Param("id")
	if !utils.IsValidUUID(id) {
		utils.Error(c, http.StatusBadRequest, "Invalid connection ID", nil)
		return
	}
	var req struct {
		PackageID string `json:"package_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}
	if !utils.IsValidUUID(req.PackageID) {
		utils.Error(c, http.StatusBadRequest, "Invalid package ID", nil)
		return
	}

	if err := h.svc.ChangeSpeed(id, req.PackageID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to change speed", nil)
		return
	}
	utils.Success(c, "Connection speed changed", nil)
}
