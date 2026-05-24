package tenant

import (
	"time"

	"github.com/google/uuid"
)

type Payment struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID    uuid.UUID `gorm:"type:uuid;not null" json:"customer_id"`
	InvoiceID     uuid.UUID `gorm:"type:uuid;not null" json:"invoice_id"`
	Amount        float64   `gorm:"not null" json:"amount"`
	PaymentMethod string    `json:"payment_method"`
	TransactionID string    `json:"-"` // Sensitive, do not expose in JSON
	PaymentDate   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"payment_date"`
	ReceivedBy    uuid.UUID `gorm:"type:uuid" json:"received_by"`
	// Status should be validated in application logic to ensure only allowed values (e.g. completed, pending, failed).
	Status        string    `gorm:"default:completed" json:"status"`
	ReceiptNo     string    `json:"-"` // Sensitive, do not expose in JSON
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
