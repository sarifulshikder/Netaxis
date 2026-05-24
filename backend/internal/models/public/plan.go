package public

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	b, err := json.Marshal(s)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal StringArray: %w", err)
	}
	return string(b), nil
}

func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = []string{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("cannot scan type %T into StringArray", value)
	}
	if len(bytes) == 0 || string(bytes) == "null" {
		*s = []string{}
		return nil
	}
	if err := json.Unmarshal(bytes, s); err != nil {
		return fmt.Errorf("failed to unmarshal StringArray: %w", err)
	}
	return nil
}

type SubscriptionPlan struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name             string         `gorm:"not null" json:"name"`
	Description      string         `json:"description"`
	Price            float64        `gorm:"not null" json:"price"`
	MaxCustomers     int            `gorm:"not null" json:"max_customers"`
	MaxStaff         int            `gorm:"not null;default:5" json:"max_staff"`
	MaxBandwidthMbps int            `gorm:"not null" json:"max_bandwidth_mbps"`
	Features         StringArray    `gorm:"type:jsonb" json:"features"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
