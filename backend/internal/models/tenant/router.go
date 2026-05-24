package tenant

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Router struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Host      string         `gorm:"not null" json:"host"`
	Port      int            `gorm:"default:8728" json:"port"`
	Username  string         `gorm:"not null" json:"username"`
	Password  string         `gorm:"not null" json:"-"`
	Model     string         `json:"model"`
	ZoneID    uuid.UUID      `gorm:"type:uuid" json:"zone_id"`
	Status    string         `gorm:"default:online" json:"status"`
	LastSync  time.Time      `json:"last_sync"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type IPPool struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	RouterID  uuid.UUID `gorm:"type:uuid;not null" json:"router_id"`
	Name      string    `gorm:"not null" json:"name"`
	Range     string    `gorm:"not null" json:"range"`
	CreatedAt time.Time `json:"created_at"`
}

type IPAssignment struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	PoolID       uuid.UUID `gorm:"type:uuid;not null" json:"pool_id"`
	IPAddress    string    `gorm:"not null" json:"ip_address"`
	ConnectionID uuid.UUID `gorm:"type:uuid" json:"connection_id"`
	Status       string    `gorm:"default:used" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
}

type BandwidthUsageLog struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ConnectionID  uuid.UUID `gorm:"type:uuid;not null" json:"connection_id"`
	UploadBytes   int64     `json:"upload_bytes"`
	DownloadBytes int64     `json:"download_bytes"`
	RecordedAt    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"recorded_at"`
}
