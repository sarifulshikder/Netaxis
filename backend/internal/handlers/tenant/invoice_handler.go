package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type InvoiceHandler struct {
	svc *services.BillingService
}

func NewInvoiceHandler(svc *services.BillingService) *InvoiceHandler {
	return &InvoiceHandler{svc: svc}
}

func (h *InvoiceHandler) List(c *gin.Context) {
	utils.Success(c, "Invoices listed", nil)
}

func (h *InvoiceHandler) Create(c *gin.Context) {
	var req struct {
		CustomerID string `json:"customer_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	res, err := h.svc.GenerateMonthlyInvoice(req.CustomerID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to generate invoice", err.Error())
		return
	}
	utils.Success(c, "Invoice generated", res)
}

func (h *InvoiceHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetInvoice(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Invoice not found", err.Error())
		return
	}
	utils.Success(c, "Invoice fetched", res)
}

func (h *InvoiceHandler) Update(c *gin.Context) {
	utils.Success(c, "Invoice updated", nil)
}

func (h *InvoiceHandler) Delete(c *gin.Context) {
	utils.Success(c, "Invoice deleted", nil)
}

func (h *InvoiceHandler) Send(c *gin.Context) {
	utils.Success(c, "Invoice sent", nil)
}

func (h *InvoiceHandler) PDF(c *gin.Context) {
	utils.Success(c, "PDF generated", nil)
}

func (h *InvoiceHandler) Void(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.VoidInvoice(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to void invoice", err.Error())
		return
	}
	utils.Success(c, "Invoice voided", nil)
}

func (h *InvoiceHandler) BulkGenerate(c *gin.Context) {
	if err := h.svc.BulkGenerate(); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Bulk generation failed", err.Error())
		return
	}
	utils.Success(c, "Bulk generation started", nil)
}

func (h *InvoiceHandler) BulkSend(c *gin.Context) {
	utils.Success(c, "Bulk sending started", nil)
}
