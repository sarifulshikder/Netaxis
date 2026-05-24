package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type PaymentHandler struct {
	svc *services.PaymentService
}

func NewPaymentHandler(svc *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{svc: svc}
}

func (h *PaymentHandler) List(c *gin.Context) {
	// Authorization check placeholder
	// if !IsAuthorized(c) { utils.Error(c, http.StatusForbidden, "Forbidden", nil); return }

	payments, err := h.svc.ListPayments()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list payments", nil)
		return
	}
	utils.Success(c, "Payments listed", payments)
}

func (h *PaymentHandler) Create(c *gin.Context) {
	// Authorization check placeholder
	// if !IsAuthorized(c) { utils.Error(c, http.StatusForbidden, "Forbidden", nil); return }

	var data tenant.Payment
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Malformed JSON")
		return
	}

	// Basic input validation
	if data.CustomerID == uuid.Nil || data.Amount <= 0 || data.InvoiceID == uuid.Nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Missing required fields")
		return
	}

	res, err := h.svc.CreatePayment(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create payment", nil)
		return
	}
	utils.Success(c, "Payment recorded", res)
}

func (h *PaymentHandler) Get(c *gin.Context) {
	// Authorization check placeholder
	// if !IsAuthorized(c) { utils.Error(c, http.StatusForbidden, "Forbidden", nil); return }

	id := c.Param("id")
	payment, err := h.svc.GetPayment(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Payment not found", nil)
		return
	}
	utils.Success(c, "Payment fetched", payment)
}

func (h *PaymentHandler) Receipt(c *gin.Context) {
	// Authorization check placeholder
	// if !IsAuthorized(c) { utils.Error(c, http.StatusForbidden, "Forbidden", nil); return }

	id := c.Param("id")
	receipt, err := h.svc.GenerateReceipt(id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to generate receipt", nil)
		return
	}
	utils.Success(c, "Receipt generated", receipt)
}

func (h *PaymentHandler) Reverse(c *gin.Context) {
	// Authorization check placeholder
	// if !IsAuthorized(c) { utils.Error(c, http.StatusForbidden, "Forbidden", nil); return }

	id := c.Param("id")
	payment, err := h.svc.GetPayment(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Payment not found", nil)
		return
	}

	if err := h.svc.ReversePayment(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to reverse payment", nil)
		return
	}
	utils.Success(c, "Payment reversed", payment)
}
