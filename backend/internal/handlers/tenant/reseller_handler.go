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
	// Authorization check placeholder
	if !utils.IsAuthorized(c, "reseller:list") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}

	res, err := h.svc.ListResellers()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list resellers", err.Error())
		return
	}
	// Filter sensitive fields
	for i := range res {
		res[i].Email = utils.MaskEmail(res[i].Email)
	}
	utils.Success(c, "Resellers listed", res)
}

func (h *ResellerHandler) Create(c *gin.Context) {
	// Authorization check placeholder
	if !utils.IsAuthorized(c, "reseller:create") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}

	var req struct {
		tenant.Reseller
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	// Input validation
	if req.Reseller.Email != "" && !utils.IsValidEmail(req.Reseller.Email) {
		utils.Error(c, http.StatusBadRequest, "Invalid email format", nil)
		return
	}
	if req.Reseller.Phone == "" {
		utils.Error(c, http.StatusBadRequest, "Phone is required", nil)
		return
	}
	if req.Password == "" {
		utils.Error(c, http.StatusBadRequest, "Password is required", nil)
		return
	}
	res, err := h.svc.CreateReseller(req.Reseller, req.Password)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create reseller", err.Error())
		return
	}
	// Filter sensitive fields
	res.Email = utils.MaskEmail(res.Email)
	utils.Success(c, "Reseller created", res)
}

func (h *ResellerHandler) Get(c *gin.Context) {
	// Authorization check placeholder
	if !utils.IsAuthorized(c, "reseller:get") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}
	id := c.Param("id")
	res, err := h.svc.GetResellerByID(id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch reseller", err.Error())
		return
	}
	if res == nil {
		utils.Error(c, http.StatusNotFound, "Reseller not found", nil)
		return
	}
	res.Email = utils.MaskEmail(res.Email)
	utils.Success(c, "Reseller fetched", res)
}

func (h *ResellerHandler) Update(c *gin.Context) {
	// Authorization check placeholder
	if !utils.IsAuthorized(c, "reseller:update") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}
	id := c.Param("id")
	var req tenant.Reseller
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	// Input validation
	if req.Email != "" && !utils.IsValidEmail(req.Email) {
		utils.Error(c, http.StatusBadRequest, "Invalid email format", nil)
		return
	}
	res, err := h.svc.UpdateReseller(id, req)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update reseller", err.Error())
		return
	}
	res.Email = utils.MaskEmail(res.Email)
	utils.Success(c, "Reseller updated", res)
}

func (h *ResellerHandler) Transactions(c *gin.Context) {
	// Authorization check placeholder
	if !utils.IsAuthorized(c, "reseller:transactions") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}
	id := c.Param("id")
	res, err := h.svc.GetTransactions(id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch transactions", err.Error())
		return
	}
	utils.Success(c, "Transactions fetched", res)
}

func (h *ResellerHandler) WalletTopup(c *gin.Context) {
	// Authorization check placeholder
	if !utils.IsAuthorized(c, "reseller:wallet_topup") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}
	id := c.Param("id")
	var req struct {
		Amount      float64 `json:"amount" binding:"required"`
		Description string  `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if req.Amount <= 0 {
		utils.Error(c, http.StatusBadRequest, "Amount must be positive", nil)
		return
	}

	if err := h.svc.WalletTopup(id, req.Amount, req.Description); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to topup wallet", err.Error())
		return
	}
	utils.Success(c, "Wallet topped up successfully", nil)
}

func (h *ResellerHandler) Customers(c *gin.Context) {
	// Authorization check placeholder
	if !utils.IsAuthorized(c, "reseller:customers") {
		utils.Error(c, http.StatusForbidden, "Unauthorized", nil)
		return
	}
	// TODO: Implement actual logic to fetch reseller customers
	utils.Success(c, "Reseller customers listed", nil)
}
