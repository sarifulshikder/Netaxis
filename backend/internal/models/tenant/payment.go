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
	TransactionID string    `json:"transaction_id"`
	PaymentDate   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"payment_date"`
	ReceivedBy    uuid.UUID `gorm:"type:uuid" json:"received_by"`
	Status        string    `gorm:"default:completed" json:"status"`
	ReceiptNo     string    `json:"receipt_no"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
