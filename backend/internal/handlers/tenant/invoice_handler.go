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
	// TODO: Implement authentication/authorization check
	// Example: if !IsAuthorized(c) { utils.Error(c, http.StatusForbidden, "Unauthorized", nil); return }

	// Placeholder for pagination/filtering
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "20")
	// TODO: Validate page/limit, fetch paginated invoices

	utils.Success(c, "Invoices listed", nil)
}

func (h *InvoiceHandler) Create(c *gin.Context) {
	// TODO: Implement authentication/authorization check

	var req struct {
		CustomerID string `json:"customer_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Malformed JSON")
		return
	}

	// Validate CustomerID is a valid UUID
	if _, err := uuid.Parse(req.CustomerID); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "CustomerID must be a valid UUID")
		return
	}

	res, err := h.svc.GenerateMonthlyInvoice(req.CustomerID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to generate invoice", "Internal error")
		return
	}
	utils.Success(c, "Invoice generated", res)
}

func (h *InvoiceHandler) Get(c *gin.Context) {
	// TODO: Implement authentication/authorization check

	id := c.Param("id")
	// Validate ID is a valid UUID
	if _, err := uuid.Parse(id); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Invoice ID must be a valid UUID")
		return
	}

	res, err := h.svc.GetInvoice(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Invoice not found", "Invoice not found")
		return
	}
	utils.Success(c, "Invoice fetched", res)
}

func (h *InvoiceHandler) Update(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	utils.Success(c, "Invoice updated", nil)
}

func (h *InvoiceHandler) Delete(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	utils.Success(c, "Invoice deleted", nil)
}

func (h *InvoiceHandler) Send(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	utils.Success(c, "Invoice sent", nil)
}

func (h *InvoiceHandler) PDF(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	utils.Success(c, "PDF generated", nil)
}

func (h *InvoiceHandler) Void(c *gin.Context) {
	// TODO: Implement authentication/authorization check

	id := c.Param("id")
	// Validate ID is a valid UUID
	if _, err := uuid.Parse(id); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Invoice ID must be a valid UUID")
		return
	}

	if err := h.svc.VoidInvoice(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to void invoice", "Internal error")
		return
	}
	utils.Success(c, "Invoice voided", nil)
}

func (h *InvoiceHandler) BulkGenerate(c *gin.Context) {
	// TODO: Implement authentication/authorization check

	if err := h.svc.BulkGenerate(); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Bulk generation failed", "Internal error")
		return
	}
	utils.Success(c, "Bulk generation started", nil)
}

func (h *InvoiceHandler) BulkSend(c *gin.Context) {
	// TODO: Implement authentication/authorization check
	utils.Success(c, "Bulk sending started", nil)
}
