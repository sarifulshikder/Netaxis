package tenant

import (
	"time"

	"github.com/google/uuid"
)

type Reseller struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name           string    `gorm:"not null" json:"name"`
	Email          string    `gorm:"uniqueIndex;not null" json:"email"`
	Phone          string    `gorm:"not null" json:"phone"`
	Address        string    `json:"address"`
	ZoneID         uuid.UUID `gorm:"type:uuid" json:"zone_id"`
	WalletBalance  float64   `gorm:"default:0.00" json:"wallet_balance"`
	CommissionRate float64   `gorm:"default:0.00" json:"commission_rate"` // Should be validated: 0-100
	Status         string    `gorm:"default:active" json:"status"` // Should be validated to allowed values: active, inactive, suspended, etc.
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type ResellerAuth struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ResellerID uuid.UUID `gorm:"type:uuid;not null" json:"reseller_id"`
	Password   string    `gorm:"not null" json:"-"` // Must always be stored as a hash, never plaintext. Never log or expose.
	CreatedAt  time.Time `json:"created_at"`
}

type ResellerTransaction struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ResellerID      uuid.UUID `gorm:"type:uuid;not null" json:"reseller_id"`
	TransactionType string    `json:"transaction_type"` // Should be validated: only "credit" or "debit"
	Amount          float64   `gorm:"not null" json:"amount"`
	BalanceAfter    float64   `gorm:"not null" json:"balance_after"`
	Description     string    `json:"description"`
	CreatedAt       time.Time `json:"created_at"`
}
