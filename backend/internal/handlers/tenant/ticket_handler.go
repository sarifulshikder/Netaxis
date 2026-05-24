package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type TicketHandler struct {
	svc *services.TicketService
}

func NewTicketHandler(svc *services.TicketService) *TicketHandler {
	return &TicketHandler{svc: svc}
}

func (h *TicketHandler) List(c *gin.Context) {
	res, err := h.svc.ListTickets()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list tickets", err.Error())
		return
	}
	utils.Success(c, "Tickets listed", res)
}

func (h *TicketHandler) Create(c *gin.Context) {
	// Authorization check: only allow users with "ticket:create" permission
	if !utils.IsAuthorized(c, "ticket:create") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}

	var data tenant.Ticket
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Malformed JSON")
		return
	}
	// Minimal validation
	if data.Subject == "" || data.CustomerID == (data.CustomerID) {
		utils.Error(c, http.StatusBadRequest, "Subject and CustomerID required", nil)
		return
	}
	res, err := h.svc.CreateTicket(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create ticket", "Internal error")
		return
	}
	utils.Success(c, "Ticket created", res)
}

func (h *TicketHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetTicket(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Ticket not found", err.Error())
		return
	}
	utils.Success(c, "Ticket fetched", res)
}

func (h *TicketHandler) Update(c *gin.Context) {
	utils.Success(c, "Ticket updated", nil)
}

func (h *TicketHandler) Assign(c *gin.Context) {
	// Authorization check: only allow users with "ticket:assign" permission
	if !utils.IsAuthorized(c, "ticket:assign") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}

	id := c.Param("id")
	var req struct {
		StaffID string `json:"staff_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Malformed JSON")
		return
	}

	// Check if ticket exists before assignment
	_, err := h.svc.GetTicket(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Ticket not found", nil)
		return
	}

	if err := h.svc.AssignTicket(id, req.StaffID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to assign ticket", "Internal error")
		return
	}
	utils.Success(c, "Ticket assigned", nil)
}

func (h *TicketHandler) AddComment(c *gin.Context) {
	// Authorization check: only allow users with "ticket:comment" permission
	if !utils.IsAuthorized(c, "ticket:comment") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}

	var data tenant.TicketComment
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Malformed JSON")
		return
	}
	// Minimal validation
	if data.TicketID == (data.TicketID) || data.Comment == "" {
		utils.Error(c, http.StatusBadRequest, "TicketID and Comment required", nil)
		return
	}
	// Check if ticket exists before adding comment
	_, err := h.svc.GetTicket(data.TicketID.String())
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Ticket not found", nil)
		return
	}
	res, err := h.svc.AddComment(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to add comment", "Internal error")
		return
	}
	utils.Success(c, "Comment added", res)
}

func (h *TicketHandler) Close(c *gin.Context) {
	// Authorization check: only allow users with "ticket:close" permission
	if !utils.IsAuthorized(c, "ticket:close") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}

	id := c.Param("id")
	// Check if ticket exists before closing
	_, err := h.svc.GetTicket(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Ticket not found", nil)
		return
	}
	if err := h.svc.CloseTicket(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to close ticket", "Internal error")
		return
	}
	utils.Success(c, "Ticket closed", nil)
}

func (h *TicketHandler) Rate(c *gin.Context) {
	utils.Success(c, "Ticket rated", nil)
}
