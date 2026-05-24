package tenant

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Invoice struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID         uuid.UUID      `gorm:"type:uuid;not null" json:"customer_id"`
	InvoiceNo          string         `gorm:"uniqueIndex;not null" json:"invoice_no"`
	BillingPeriodStart time.Time      `json:"billing_period_start"`
	BillingPeriodEnd   time.Time      `json:"billing_period_end"`
	DueDate            time.Time      `json:"due_date"`
	Subtotal           float64        `gorm:"not null" json:"subtotal"`
	Discount           float64        `gorm:"default:0.00" json:"discount"`
	Tax                float64        `gorm:"default:0.00" json:"tax"`
	LateFee            float64        `gorm:"default:0.00" json:"late_fee"`
	TotalAmount        float64        `gorm:"not null" json:"total_amount"`
	PaidAmount         float64        `gorm:"default:0.00" json:"paid_amount"`
	Status             string         `gorm:"default:pending" json:"status"`
	Notes              string         `json:"notes"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
	Items              []InvoiceItem  `gorm:"foreignKey:InvoiceID" json:"items"`
}

type InvoiceItem struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	InvoiceID   uuid.UUID `gorm:"type:uuid;not null" json:"invoice_id"`
	Description string    `gorm:"not null" json:"description"`
	Quantity    int       `gorm:"default:1" json:"quantity"`
	UnitPrice   float64   `gorm:"not null" json:"unit_price"`
	TotalPrice  float64   `gorm:"not null" json:"total_price"`
	CreatedAt   time.Time `json:"created_at"`
}
