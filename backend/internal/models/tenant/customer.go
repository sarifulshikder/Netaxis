package tenant

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Customer struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerCode string         `gorm:"uniqueIndex;not null" json:"customer_code"`
	Name         string         `gorm:"not null" json:"name"`
	Email        string         `json:"email"`
	Phone        string         `gorm:"not null" json:"phone"`
	Address      string         `json:"address"`
	Area         string         `json:"area"`
	ZoneID       uuid.UUID      `gorm:"type:uuid" json:"zone_id"`
	NID          string         `json:"nid"`
	PhotoURL     string         `json:"photo_url"`
	Status       string         `gorm:"default:active" json:"status"`
	WalletBalance float64       `gorm:"default:0.00" json:"wallet_balance"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type CustomerDocument struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID uuid.UUID `gorm:"type:uuid;not null" json:"customer_id"`
	DocType    string    `json:"doc_type"`
	FileURL    string    `json:"file_url"`
	CreatedAt  time.Time `json:"created_at"`
}

type CustomerNote struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID uuid.UUID `gorm:"type:uuid;not null" json:"customer_id"`
	Note       string    `json:"note"`
	CreatedBy  uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt  time.Time `json:"created_at"`
}
