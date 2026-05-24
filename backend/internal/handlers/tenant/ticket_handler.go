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
	var data tenant.Ticket
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.CreateTicket(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create ticket", err.Error())
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
	id := c.Param("id")
	var req struct {
		StaffID string `json:"staff_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.svc.AssignTicket(id, req.StaffID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to assign ticket", err.Error())
		return
	}
	utils.Success(c, "Ticket assigned", nil)
}

func (h *TicketHandler) AddComment(c *gin.Context) {
	var data tenant.TicketComment
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.AddComment(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to add comment", err.Error())
		return
	}
	utils.Success(c, "Comment added", res)
}

func (h *TicketHandler) Close(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.CloseTicket(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to close ticket", err.Error())
		return
	}
	utils.Success(c, "Ticket closed", nil)
}

func (h *TicketHandler) Rate(c *gin.Context) {
	utils.Success(c, "Ticket rated", nil)
}
