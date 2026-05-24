package tenant

import (
	"time"

	"github.com/google/uuid"
)

type AccountType struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name      string    `gorm:"uniqueIndex;not null" json:"name"` // Asset, Liability, Equity, Revenue, Expense
	CreatedAt time.Time `json:"created_at"`
}

type ChartOfAccounts struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name          string     `gorm:"not null" json:"name"`
	Code          string     `gorm:"uniqueIndex;not null" json:"code"`
	AccountTypeID uuid.UUID  `gorm:"type:uuid;not null" json:"account_type_id"`
	ParentID      *uuid.UUID `gorm:"type:uuid" json:"parent_id"`
	IsActive      bool       `gorm:"default:true" json:"is_active"`
	CreatedAt     time.Time  `json:"created_at"`
}

type JournalEntry struct {
	ID          uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	EntryDate   time.Time     `gorm:"default:CURRENT_DATE" json:"entry_date"`
	Description string        `json:"description"`
	Reference   string        `json:"reference"`
	CreatedAt   time.Time     `json:"created_at"`
	Lines       []JournalLine `gorm:"foreignKey:JournalEntryID" json:"lines"`
}

type JournalLine struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	JournalEntryID uuid.UUID `gorm:"type:uuid;not null" json:"journal_entry_id"`
	AccountID      uuid.UUID `gorm:"type:uuid;not null" json:"account_id"`
	Debit          float64   `gorm:"default:0.00" json:"debit"`
	Credit         float64   `gorm:"default:0.00" json:"credit"`
	CreatedAt      time.Time `json:"created_at"`
}

type BankAccount struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	BankName    string    `gorm:"not null" json:"bank_name"`
	AccountNo   string    `gorm:"not null" json:"-"` // Sensitive, do not expose in JSON
	AccountName string    `gorm:"not null" json:"account_name"`
	Branch      string    `json:"branch"`
	Balance     float64   `gorm:"default:0.00" json:"balance"`
	CreatedAt   time.Time `json:"created_at"`
}

type Expense struct {
	ID          uuid.UUID   `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CategoryID  uuid.UUID   `gorm:"type:uuid;not null" json:"category_id"`
	Amount      float64     `gorm:"not null" json:"amount"`
	ExpenseDate time.Time   `gorm:"default:CURRENT_DATE" json:"expense_date"`
	PaidFromID  *uuid.UUID  `gorm:"type:uuid" json:"paid_from_id"` // Nullable, can be nil
	Description string      `json:"description"`
	ApprovedBy  *uuid.UUID  `gorm:"type:uuid" json:"approved_by"`
	Status      string      `gorm:"default:pending" json:"status"`
	CreatedAt   time.Time   `json:"created_at"`
}

func (c *ChartOfAccounts) TableName() string    { return "chart_of_accounts" }
func (j *JournalEntry) TableName() string       { return "journal_entries" }
func (l *JournalLine) TableName() string        { return "journal_lines" }
func (b *BankAccount) TableName() string        { return "bank_accounts" }
func (a *AccountType) TableName() string        { return "account_types" }
