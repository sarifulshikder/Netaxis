package tenant

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ItemCategory struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type InventoryItem struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CategoryID     uuid.UUID      `gorm:"type:uuid;not null" json:"category_id"`
	Name           string         `gorm:"not null" json:"name"`
	SKU            string         `gorm:"uniqueIndex" json:"sku"`
	Description    string         `json:"description"`
	CurrentStock   int            `gorm:"default:0" json:"current_stock"`
	MinStockLevel  int            `gorm:"default:5" json:"min_stock_level"`
	UnitPrice      float64        `json:"unit_price"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

type Vendor struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name          string    `gorm:"not null" json:"name"`
	ContactPerson string    `json:"contact_person"`
	Phone         string    `json:"phone"`
	Email         string    `json:"email"`
	Address       string    `json:"address"`
	CreatedAt     time.Time `json:"created_at"`
}

type InventoryTransaction struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ItemID          uuid.UUID `gorm:"type:uuid;not null" json:"item_id"`
	TransactionType string    `json:"transaction_type"` // stock_in, stock_out
	Quantity        int       `gorm:"not null" json:"quantity"`
	UnitPrice       float64   `json:"unit_price"`
	VendorID        *uuid.UUID `gorm:"type:uuid" json:"vendor_id"`
	Notes           string    `json:"notes"`
	CreatedAt       time.Time `json:"created_at"`
}

type DeviceAssignment struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ItemID         uuid.UUID  `gorm:"type:uuid;not null" json:"item_id"`
	CustomerID     uuid.UUID  `gorm:"type:uuid;not null" json:"customer_id"`
	ConnectionID   uuid.UUID  `gorm:"type:uuid;not null" json:"connection_id"`
	SerialNumber   string     `json:"serial_number"`
	MacAddress     string     `json:"mac_address"`
	AssignmentDate time.Time  `gorm:"default:CURRENT_DATE" json:"assignment_date"`
	ReturnDate     *time.Time `json:"return_date"`
	Status         string     `gorm:"default:active" json:"status"`
	CreatedAt      time.Time  `json:"created_at"`
}

func (ItemCategory) TableName() string         { return "item_categories" }
func (InventoryItem) TableName() string        { return "inventory_items" }
func (InventoryTransaction) TableName() string { return "inventory_transactions" }
func (DeviceAssignment) TableName() string     { return "device_assignments" }
