package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type AccountingHandler struct {
	svc *services.AccountingService
}

func NewAccountingHandler(svc *services.AccountingService) *AccountingHandler {
	return &AccountingHandler{svc: svc}
}

func (h *AccountingHandler) ListAccounts(c *gin.Context) {
	res, err := h.svc.ListAccounts()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list accounts", err.Error())
		return
	}
	utils.Success(c, "Accounts listed", res)
}

func (h *AccountingHandler) CreateAccount(c *gin.Context) {
	var data tenant.ChartOfAccounts
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.CreateAccount(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create account", err.Error())
		return
	}
	utils.Success(c, "Account created", res)
}

func (h *AccountingHandler) ListJournalEntries(c *gin.Context) {
	utils.Success(c, "Journal entries listed", nil)
}

func (h *AccountingHandler) CreateJournalEntry(c *gin.Context) {
	var data tenant.JournalEntry
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.CreateJournalEntry(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create journal entry", err.Error())
		return
	}
	utils.Success(c, "Journal entry created", res)
}

func (h *AccountingHandler) ListBankAccounts(c *gin.Context) {
	res, err := h.svc.ListBankAccounts()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list bank accounts", err.Error())
		return
	}
	utils.Success(c, "Bank accounts listed", res)
}

func (h *AccountingHandler) CreateBankAccount(c *gin.Context) {
	var data tenant.BankAccount
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.CreateBankAccount(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create bank account", err.Error())
		return
	}
	utils.Success(c, "Bank account created", res)
}

func (h *AccountingHandler) ListExpenses(c *gin.Context) {
	utils.Success(c, "Expenses listed", nil)
}

func (h *AccountingHandler) CreateExpense(c *gin.Context) {
	var data tenant.Expense
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	res, err := h.svc.CreateExpense(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create expense", err.Error())
		return
	}
	utils.Success(c, "Expense created", res)
}

func (h *AccountingHandler) ApproveExpense(c *gin.Context) {
	id := c.Param("id")
	adminID := c.GetString("user_id")
	if err := h.svc.ApproveExpense(id, adminID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to approve expense", err.Error())
		return
	}
	utils.Success(c, "Expense approved", nil)
}
