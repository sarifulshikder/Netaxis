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
	utils.Success(c, "Payments listed", nil)
}

func (h *PaymentHandler) Create(c *gin.Context) {
	var data tenant.Payment
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	res, err := h.svc.CreatePayment(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create payment", err.Error())
		return
	}
	utils.Success(c, "Payment recorded", res)
}

func (h *PaymentHandler) Get(c *gin.Context) {
	utils.Success(c, "Payment fetched", nil)
}

func (h *PaymentHandler) Receipt(c *gin.Context) {
	utils.Success(c, "Receipt generated", nil)
}

func (h *PaymentHandler) Reverse(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.ReversePayment(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to reverse payment", err.Error())
		return
	}
	utils.Success(c, "Payment reversed", nil)
}
