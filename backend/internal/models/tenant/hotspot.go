package tenant

import (
	"time"

	"github.com/google/uuid"
)

type HotspotProfile struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name             string    `gorm:"not null" json:"name"`
	Price            float64   `gorm:"not null" json:"price"`
	ValidityMinutes  int       `gorm:"not null" json:"validity_minutes"` // Should be validated to be positive
	BandwidthLimit   string    `json:"bandwidth_limit"`
	MikrotikProfile  string    `json:"mikrotik_profile"`
	CreatedAt        time.Time `json:"created_at"`
}

type HotspotVoucher struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ProfileID  uuid.UUID  `gorm:"type:uuid;not null" json:"profile_id"`
	Code       string     `gorm:"uniqueIndex;not null" json:"code"`
	BatchName  string     `json:"batch_name"`
	Status     string     `gorm:"default:available" json:"status"` // Should be validated to allowed values: available, used, expired
	UsedAt     *time.Time `json:"used_at"`
	UsedByMac  string     `json:"used_by_mac"` // Should be validated for correct MAC address format in application logic
	CreatedAt  time.Time  `json:"created_at"`
}

type HotspotSession struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	VoucherID  uuid.UUID  `gorm:"type:uuid;not null" json:"voucher_id"`
	MacAddress string     `json:"mac_address"` // Should be validated for correct MAC address format in application logic
	IPAddress  string     `json:"ip_address"`  // Should be validated for correct IP address format in application logic
	StartTime  time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"start_time"`
	EndTime    *time.Time `json:"end_time"`
	BytesIn    int64      `json:"bytes_in"`
	BytesOut   int64      `json:"bytes_out"`
}

type HotspotUser struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Username  string    `gorm:"uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"not null" json:"-"` // Must always be stored as a hash, never plaintext
	ProfileID uuid.UUID `gorm:"type:uuid;not null" json:"profile_id"`
	CreatedAt time.Time `json:"created_at"`
}
