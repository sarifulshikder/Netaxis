package tenant

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Connection struct {
	ID                  uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID          uuid.UUID      `gorm:"type:uuid;not null" json:"customer_id"`
	PackageID           uuid.UUID      `gorm:"type:uuid;not null" json:"package_id"`
	RouterID            uuid.UUID      `gorm:"type:uuid;not null" json:"router_id"`
	Username            string         `gorm:"uniqueIndex;not null" json:"username"`
	// Password must always be stored as a hash, never plaintext.
	Password            string         `gorm:"not null" json:"-"`
	// IPAddress may be sensitive, consider not exposing in JSON unless required.
	IPAddress           string         `gorm:"not null" json:"-"`
	// MacAddress may be sensitive, consider not exposing in JSON unless required.
	MacAddress          string         `gorm:"not null" json:"-"`
	// InstallationAddress may be sensitive, consider not exposing in JSON unless required.
	InstallationAddress string         `gorm:"not null" json:"-"`
	Status              string         `gorm:"default:active" json:"status"`
	InstallationDate    time.Time      `json:"installation_date"`
	BillingCycleDay     int            `gorm:"default:1" json:"billing_cycle_day"`
	AutoResume          bool           `gorm:"default:true" json:"auto_resume"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}
