package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type NotificationHandler struct {
	svc *services.NotificationService
}

func NewNotificationHandler(svc *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{svc: svc}
}

func (h *NotificationHandler) ListTemplates(c *gin.Context) {
	res, err := h.svc.ListTemplates()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list templates", err.Error())
		return
	}
	utils.Success(c, "Templates listed", res)
}

func (h *NotificationHandler) UpdateTemplate(c *gin.Context) {
	id := c.Param("id")
	var data tenant.NotificationTemplate
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if err := h.svc.UpdateTemplate(id, data); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update template", err.Error())
		return
	}
	utils.Success(c, "Template updated", nil)
}

func (h *NotificationHandler) Send(c *gin.Context) {
	var req struct {
		CustomerID string            `json:"customer_id" binding:"required"`
		EventType  string            `json:"event_type" binding:"required"`
		Data       map[string]string `json:"data"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if err := h.svc.Send(req.CustomerID, req.EventType, req.Data); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to send notification", err.Error())
		return
	}
	utils.Success(c, "Notification sent", nil)
}

func (h *NotificationHandler) BulkSMS(c *gin.Context) {
	utils.Success(c, "Bulk SMS sent", nil)
}

func (h *NotificationHandler) Logs(c *gin.Context) {
	utils.Success(c, "Notification logs listed", nil)
}
