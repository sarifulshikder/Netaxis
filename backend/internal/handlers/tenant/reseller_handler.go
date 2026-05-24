package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type ResellerHandler struct {
	svc *services.ResellerService
}

func NewResellerHandler(svc *services.ResellerService) *ResellerHandler {
	return &ResellerHandler{svc: svc}
}

func (h *ResellerHandler) List(c *gin.Context) {
	res, err := h.svc.ListResellers()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list resellers", err.Error())
		return
	}
	utils.Success(c, "Resellers listed", res)
}

func (h *ResellerHandler) Create(c *gin.Context) {
	var req struct {
		tenant.Reseller
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.CreateReseller(req.Reseller, req.Password)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create reseller", err.Error())
		return
	}
	utils.Success(c, "Reseller created", res)
}

func (h *ResellerHandler) Get(c *gin.Context) {
	utils.Success(c, "Reseller fetched", nil)
}

func (h *ResellerHandler) Update(c *gin.Context) {
	utils.Success(c, "Reseller updated", nil)
}

func (h *ResellerHandler) Transactions(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetTransactions(id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch transactions", err.Error())
		return
	}
	utils.Success(c, "Transactions fetched", res)
}

func (h *ResellerHandler) WalletTopup(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Amount      float64 `json:"amount" binding:"required"`
		Description string  `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.svc.WalletTopup(id, req.Amount, req.Description); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to topup wallet", err.Error())
		return
	}
	utils.Success(c, "Wallet topped up successfully", nil)
}

func (h *ResellerHandler) Customers(c *gin.Context) {
	utils.Success(c, "Reseller customers listed", nil)
}
