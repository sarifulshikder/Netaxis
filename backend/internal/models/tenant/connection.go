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
	Password            string         `gorm:"not null" json:"password"`
	IPAddress           string         `json:"ip_address"`
	MacAddress          string         `json:"mac_address"`
	InstallationAddress string         `json:"installation_address"`
	Status              string         `gorm:"default:active" json:"status"`
	InstallationDate    time.Time      `json:"installation_date"`
	BillingCycleDay     int            `gorm:"default:1" json:"billing_cycle_day"`
	AutoResume          bool           `gorm:"default:true" json:"auto_resume"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}
