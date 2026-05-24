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
	res, err := h.svc.ListItems()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list items", err.Error())
		return
	}
	utils.Success(c, "Items listed", res)
}

func (h *InventoryHandler) CreateItem(c *gin.Context) {
	var data tenant.InventoryItem
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.CreateItem(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create item", err.Error())
		return
	}
	utils.Success(c, "Item created", res)
}

func (h *InventoryHandler) UpdateItem(c *gin.Context) {
	utils.Success(c, "Item updated", nil)
}

func (h *InventoryHandler) ListTransactions(c *gin.Context) {
	res, err := h.svc.ListTransactions()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list transactions", err.Error())
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
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.svc.StockIn(req.ItemID, req.Quantity, req.UnitPrice, req.VendorID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to record transaction", err.Error())
		return
	}
	utils.Success(c, "Transaction recorded", nil)
}

func (h *InventoryHandler) ListAssignments(c *gin.Context) {
	res, err := h.svc.ListAssignments()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list assignments", err.Error())
		return
	}
	utils.Success(c, "Assignments listed", res)
}

func (h *InventoryHandler) CreateAssignment(c *gin.Context) {
	var data tenant.DeviceAssignment
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.AssignDevice(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to assign device", err.Error())
		return
	}
	utils.Success(c, "Device assigned", res)
}

func (h *InventoryHandler) ReturnDevice(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.ReturnDevice(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to return device", err.Error())
		return
	}
	utils.Success(c, "Device returned", nil)
}

func (h *InventoryHandler) ListVendors(c *gin.Context) {
	res, err := h.svc.ListVendors()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list vendors", err.Error())
		return
	}
	utils.Success(c, "Vendors listed", res)
}

func (h *InventoryHandler) CreateVendor(c *gin.Context) {
	var data tenant.Vendor
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.CreateVendor(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create vendor", err.Error())
		return
	}
	utils.Success(c, "Vendor created", res)
}
