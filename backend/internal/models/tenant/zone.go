package tenant

import (
	"time"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Zone represents a geographical or logical grouping.
// Security/validation improvements:
// - Name is validated to prevent empty/whitespace-only values and excessive length.
// - Description is limited in length to prevent abuse/storage issues.
type Zone struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name        string         `gorm:"not null;size:100" json:"name"`
	ParentID    *uuid.UUID     `gorm:"type:uuid" json:"parent_id"`
	Description string         `gorm:"size:500" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// ValidateZone checks for basic security and data integrity issues.
func ValidateZone(z *Zone) error {
	if strings.TrimSpace(z.Name) == "" {
		return ErrZoneNameEmpty
	}
	if len(z.Name) > 100 {
		return ErrZoneNameTooLong
	}
	if len(z.Description) > 500 {
		return ErrZoneDescriptionTooLong
	}
	return nil
}

var (
	ErrZoneNameEmpty         = gorm.ErrInvalidData
	ErrZoneNameTooLong       = gorm.ErrInvalidData
	ErrZoneDescriptionTooLong = gorm.ErrInvalidData
)
