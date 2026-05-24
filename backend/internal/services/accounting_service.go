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
		return nil, err
	}
	return &data, nil
}

func (s *AccountingService) CreateAccount(data tenant.ChartOfAccounts) (*tenant.ChartOfAccounts, error) {
	data.ID = uuid.New()
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *AccountingService) ListAccounts() ([]tenant.ChartOfAccounts, error) {
	var accounts []tenant.ChartOfAccounts
	err := s.db.Find(&accounts).Error
	return accounts, err
}

func (s *AccountingService) CreateExpense(data tenant.Expense) (*tenant.Expense, error) {
	data.ID = uuid.New()
	data.Status = "pending"
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *AccountingService) ApproveExpense(id string, adminID string) error {
	adminUUID, _ := uuid.Parse(adminID)
	return s.db.Model(&tenant.Expense{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":      "approved",
		"approved_by": &adminUUID,
	}).Error
}

func (s *AccountingService) ListBankAccounts() ([]tenant.BankAccount, error) {
	var accounts []tenant.BankAccount
	err := s.db.Find(&accounts).Error
	return accounts, err
}

func (s *AccountingService) CreateBankAccount(data tenant.BankAccount) (*tenant.BankAccount, error) {
	data.ID = uuid.New()
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}
