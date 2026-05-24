package tenant

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Package struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name            string         `gorm:"not null" json:"name"`
	UploadSpeed     int            `gorm:"not null" json:"upload_speed"`
	DownloadSpeed   int            `gorm:"not null" json:"download_speed"`
	Price           float64        `gorm:"not null" json:"price"`
	MikrotikProfile string         `json:"mikrotik_profile"`
	IsActive        bool           `gorm:"default:true" json:"is_active"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}
