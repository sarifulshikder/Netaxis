package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type InventoryHandler struct {
	svc *services.InventoryService
}

func NewInventoryHandler(svc *services.InventoryService) *InventoryHandler {
	return &InventoryHandler{svc: svc}
}

func (h *InventoryHandler) ListItems(c *gin.Context) {
	// TODO: Add pagination and authorization
	res, err := h.svc.ListItems()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list items", "Internal error")
		return
	}
	utils.Success(c, "Items listed", res)
}

func (h *InventoryHandler) CreateItem(c *gin.Context) {
	var data tenant.InventoryItem
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Malformed JSON")
		return
	}
	// Basic validation
	if data.Name == "" || data.CategoryID == uuid.Nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Name and category_id are required")
		return
	}
	res, err := h.svc.CreateItem(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create item", "Internal error")
		return
	}
	utils.Success(c, "Item created", res)
}

func (h *InventoryHandler) UpdateItem(c *gin.Context) {
	// TODO: Implement update logic with validation and authorization
	utils.Error(c, http.StatusNotImplemented, "Not implemented", nil)
}

func (h *InventoryHandler) ListTransactions(c *gin.Context) {
	// TODO: Add pagination and authorization
	res, err := h.svc.ListTransactions()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list transactions", "Internal error")
		return
	}
	utils.Success(c, "Transactions listed", res)
}

func (h *InventoryHandler) CreateTransaction(c *gin.Context) {
	var req struct {
		ItemID    string  `json:"item_id" binding:"required"`
		Quantity  int     `json:"quantity" binding:"required"`
		UnitPrice float64 `json:"unit_price"`
		VendorID  string  `json:"vendor_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Malformed JSON")
		return
	}
	// Validate UUID
	if _, err := uuid.Parse(req.ItemID); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Invalid item_id")
		return
	}
	if req.VendorID != "" {
		if _, err := uuid.Parse(req.VendorID); err != nil {
			utils.Error(c, http.StatusBadRequest, "Invalid request", "Invalid vendor_id")
			return
		}
	}
	// Validate quantity and price
	if req.Quantity <= 0 {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Quantity must be positive")
		return
	}
	if req.UnitPrice < 0 {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Unit price cannot be negative")
		return
	}

	if err := h.svc.StockIn(req.ItemID, req.Quantity, req.UnitPrice, req.VendorID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to record transaction", "Internal error")
		return
	}
	utils.Success(c, "Transaction recorded", nil)
}

func (h *InventoryHandler) ListAssignments(c *gin.Context) {
	// TODO: Add pagination and authorization
	res, err := h.svc.ListAssignments()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list assignments", "Internal error")
		return
	}
	utils.Success(c, "Assignments listed", res)
}

func (h *InventoryHandler) CreateAssignment(c *gin.Context) {
	var data tenant.DeviceAssignment
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Malformed JSON")
		return
	}
	// Validate required fields
	if data.ItemID == uuid.Nil || data.CustomerID == uuid.Nil || data.ConnectionID == uuid.Nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "item_id, customer_id, and connection_id are required")
		return
	}
	res, err := h.svc.AssignDevice(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to assign device", "Internal error")
		return
	}
	utils.Success(c, "Device assigned", res)
}

func (h *InventoryHandler) ReturnDevice(c *gin.Context) {
	id := c.Param("id")
	// Validate UUID
	if _, err := uuid.Parse(id); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Invalid device assignment id")
		return
	}
	if err := h.svc.ReturnDevice(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to return device", "Internal error")
		return
	}
	utils.Success(c, "Device returned", nil)
}

func (h *InventoryHandler) ListVendors(c *gin.Context) {
	// TODO: Add pagination and authorization
	res, err := h.svc.ListVendors()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list vendors", "Internal error")
		return
	}
	utils.Success(c, "Vendors listed", res)
}

func (h *InventoryHandler) CreateVendor(c *gin.Context) {
	var data tenant.Vendor
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Malformed JSON")
		return
	}
	// Basic validation
	if data.Name == "" {
		utils.Error(c, http.StatusBadRequest, "Invalid request", "Name is required")
		return
	}
	res, err := h.svc.CreateVendor(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create vendor", "Internal error")
		return
	}
	utils.Success(c, "Vendor created", res)
}
