package tenant

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Customer struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerCode  string         `gorm:"uniqueIndex;not null" json:"customer_code"`
	Name          string         `gorm:"not null" json:"name"`
	Email         string         `gorm:"not null" json:"email"` // Require email for contactability
	Phone         string         `gorm:"uniqueIndex;not null" json:"phone"` // Make phone unique to prevent duplicate customers
	Address       string         `json:"address"`
	Area          string         `json:"area"`
	ZoneID        uuid.UUID      `gorm:"type:uuid" json:"zone_id"`
	NID           string         `json:"nid"`
	PhotoURL      string         `json:"photo_url"`
	Status        string         `gorm:"default:active" json:"status"`
	WalletBalance float64        `gorm:"default:0.00" json:"wallet_balance"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type CustomerDocument struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID uuid.UUID `gorm:"type:uuid;not null;index" json:"customer_id"` // Add index for performance
	DocType    string    `gorm:"not null" json:"doc_type"` // Require doc type
	FileURL    string    `gorm:"not null" json:"file_url"` // Require file url
	CreatedAt  time.Time `json:"created_at"`
}

type CustomerNote struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID uuid.UUID `gorm:"type:uuid;not null;index" json:"customer_id"` // Add index for performance
	Note       string    `gorm:"not null" json:"note"` // Require note
	CreatedBy  uuid.UUID `gorm:"type:uuid;not null" json:"created_by"` // Require created_by
	CreatedAt  time.Time `json:"created_at"`
}
