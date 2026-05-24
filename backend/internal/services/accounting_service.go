package services

import (
	"errors"

	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type AccountingService struct {
	db *gorm.DB
}

func NewAccountingService(db *gorm.DB) *AccountingService {
	return &AccountingService{db: db}
}

func (s *AccountingService) CreateJournalEntry(data tenant.JournalEntry) (*tenant.JournalEntry, error) {
	data.ID = uuid.New()

	// Validate that there are lines
	if data.Lines == nil || len(data.Lines) == 0 {
		return nil, errors.New("journal entry must have at least one line")
	}

	// Validate balance
	var totalDebit, totalCredit float64
	for i := range data.Lines {
		data.Lines[i].ID = uuid.New()
		data.Lines[i].JournalEntryID = data.ID
		totalDebit += data.Lines[i].Debit
		totalCredit += data.Lines[i].Credit
	}

	if totalDebit != totalCredit {
		return nil, errors.New("journal entry must balance: total debit must equal total credit")
	}

	if err := s.db.Create(&data).Error; err != nil {
		return nil, errors.New("failed to create journal entry: " + err.Error())
	}
	return &data, nil
}

func (s *AccountingService) CreateAccount(data tenant.ChartOfAccounts) (*tenant.ChartOfAccounts, error) {
	data.ID = uuid.New()
	// Basic validation
	if data.Name == "" || data.Code == "" || data.AccountTypeID == uuid.Nil {
		return nil, errors.New("missing required fields: name, code, or account_type_id")
	}
	if err := s.db.Create(&data).Error; err != nil {
		return nil, errors.New("failed to create account: " + err.Error())
	}
	return &data, nil
}

func (s *AccountingService) ListAccounts() ([]tenant.ChartOfAccounts, error) {
	var accounts []tenant.ChartOfAccounts
	err := s.db.Find(&accounts).Error
	if err != nil {
		return nil, errors.New("failed to list accounts: " + err.Error())
	}
	return accounts, nil
}

func (s *AccountingService) CreateExpense(data tenant.Expense) (*tenant.Expense, error) {
	data.ID = uuid.New()
	data.Status = "pending"
	// Basic validation
	if data.CategoryID == uuid.Nil || data.Amount <= 0 {
		return nil, errors.New("missing required fields: category_id or amount")
	}
	if err := s.db.Create(&data).Error; err != nil {
		return nil, errors.New("failed to create expense: " + err.Error())
	}
	return &data, nil
}

func (s *AccountingService) ApproveExpense(id string, adminID string) error {
	expenseUUID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid expense id")
	}
	adminUUID, err := uuid.Parse(adminID)
	if err != nil {
		return errors.New("invalid admin id")
	}
	result := s.db.Model(&tenant.Expense{}).Where("id = ?", expenseUUID).Updates(map[string]interface{}{
		"status":      "approved",
		"approved_by": &adminUUID,
	})
	if result.Error != nil {
		return errors.New("failed to approve expense: " + result.Error.Error())
	}
	if result.RowsAffected == 0 {
		return errors.New("expense not found or not updated")
	}
	return nil
}

func (s *AccountingService) ListBankAccounts() ([]tenant.BankAccount, error) {
	var accounts []tenant.BankAccount
	err := s.db.Find(&accounts).Error
	if err != nil {
		return nil, errors.New("failed to list bank accounts: " + err.Error())
	}
	return accounts, nil
}

func (s *AccountingService) CreateBankAccount(data tenant.BankAccount) (*tenant.BankAccount, error) {
	data.ID = uuid.New()
	// Basic validation
	if data.BankName == "" || data.AccountNo == "" || data.AccountName == "" {
		return nil, errors.New("missing required fields: bank_name, account_no, or account_name")
	}
	if err := s.db.Create(&data).Error; err != nil {
		return nil, errors.New("failed to create bank account: " + err.Error())
	}
	return &data, nil
}
