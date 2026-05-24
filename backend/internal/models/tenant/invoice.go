package tenant

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Invoice struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"customer_id"` // Add index for performance
	InvoiceNo          string         `gorm:"uniqueIndex;not null" json:"invoice_no"`
	BillingPeriodStart time.Time      `json:"billing_period_start"`
	BillingPeriodEnd   time.Time      `json:"billing_period_end"`
	DueDate            time.Time      `json:"due_date"`
	Subtotal           float64        `gorm:"not null;check:subtotal >= 0" json:"subtotal"` // Must be >= 0
	Discount           float64        `gorm:"default:0.00;check:discount >= 0" json:"discount"` // Must be >= 0
	Tax                float64        `gorm:"default:0.00;check:tax >= 0" json:"tax"` // Must be >= 0
	LateFee            float64        `gorm:"default:0.00;check:late_fee >= 0" json:"late_fee"` // Must be >= 0
	TotalAmount        float64        `gorm:"not null;check:total_amount >= 0" json:"total_amount"` // Must be >= 0
	PaidAmount         float64        `gorm:"default:0.00;check:paid_amount >= 0" json:"paid_amount"` // Must be >= 0
	Status             string         `gorm:"default:pending" json:"status"`
	Notes              string         `json:"notes"` // Sanitize in handlers to prevent XSS
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
	Items              []InvoiceItem  `gorm:"foreignKey:InvoiceID" json:"items"`
	// Note: TotalAmount should be calculated as Subtotal - Discount + Tax + LateFee
}

type InvoiceItem struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	InvoiceID   uuid.UUID `gorm:"type:uuid;not null;index" json:"invoice_id"` // Add index for performance
	Description string    `gorm:"not null" json:"description"`
	Quantity    int       `gorm:"default:1;check:quantity >= 1" json:"quantity"` // Must be >= 1
	UnitPrice   float64   `gorm:"not null;check:unit_price >= 0" json:"unit_price"` // Must be >= 0
	TotalPrice  float64   `gorm:"not null;check:total_price >= 0" json:"total_price"` // Must be >= 0
	CreatedAt   time.Time `json:"created_at"`
	// Note: TotalPrice should be calculated as Quantity * UnitPrice
}
