package tenant

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type NotificationHandler struct {
	svc *services.NotificationService
}

// Placeholder for authentication/authorization middleware
func requireAuth(c *gin.Context) {
	// TODO: Implement proper authentication/authorization
	// For now, just pass through
	// Example: if !IsAuthorized(c) { utils.Error(c, http.StatusUnauthorized, "Unauthorized", nil); c.Abort(); return }
}

func NewNotificationHandler(svc *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{svc: svc}
}

func (h *NotificationHandler) ListTemplates(c *gin.Context) {
	requireAuth(c)
	res, err := h.svc.ListTemplates()
	if err != nil {
		log.Printf("[NotificationHandler] ListTemplates error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to list templates", err.Error())
		return
	}
	utils.Success(c, "Templates listed", res)
}

func (h *NotificationHandler) UpdateTemplate(c *gin.Context) {
	requireAuth(c)
	id := c.Param("id")
	var data tenant.NotificationTemplate
	if err := c.ShouldBindJSON(&data); err != nil {
		log.Printf("[NotificationHandler] UpdateTemplate bind error: %v", err)
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if err := h.svc.UpdateTemplate(id, data); err != nil {
		log.Printf("[NotificationHandler] UpdateTemplate update error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to update template", err.Error())
		return
	}
	utils.Success(c, "Template updated", nil)
}

func (h *NotificationHandler) Send(c *gin.Context) {
	requireAuth(c)
	var req struct {
		CustomerID string            `json:"customer_id" binding:"required"`
		EventType  string            `json:"event_type" binding:"required"`
		Data       map[string]string `json:"data"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[NotificationHandler] Send bind error: %v", err)
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	// Limit Data payload to prevent abuse
	if req.Data != nil && len(req.Data) > 50 {
		utils.Error(c, http.StatusBadRequest, "Too many data fields", "Maximum 50 allowed")
		return
	}
	if err := h.svc.Send(req.CustomerID, req.EventType, req.Data); err != nil {
		log.Printf("[NotificationHandler] Send error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to send notification", err.Error())
		return
	}
	utils.Success(c, "Notification sent", nil)
}

func (h *NotificationHandler) BulkSMS(c *gin.Context) {
	requireAuth(c)
	var req struct {
		Message string   `json:"message" binding:"required"`
		Recipients []string `json:"recipients" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[NotificationHandler] BulkSMS bind error: %v", err)
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if len(req.Recipients) == 0 || len(req.Recipients) > 1000 {
		utils.Error(c, http.StatusBadRequest, "Invalid recipients", "Must provide 1-1000 recipients")
		return
	}
	// TODO: Implement actual bulk SMS sending logic
	utils.Success(c, "Bulk SMS sent", nil)
}

func (h *NotificationHandler) Logs(c *gin.Context) {
	requireAuth(c)
	// Example: validate query params for pagination
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "50")
	// TODO: Implement actual log listing logic, with pagination
	utils.Success(c, "Notification logs listed", nil)
}
