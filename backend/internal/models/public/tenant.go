package public

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Tenant struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name       string         `gorm:"not null" json:"name" validate:"required"`
	Slug       string         `gorm:"uniqueIndex;not null" json:"slug" validate:"required,lowercase"`
	Email      string         `gorm:"uniqueIndex;not null" json:"email" validate:"required,email,lowercase"`
	Phone      string         `json:"phone"`
	OwnerName  string         `json:"owner_name"`
	Address    string         `json:"address"`
	SchemaName string         `gorm:"uniqueIndex;not null" json:"schema_name" validate:"required,lowercase"`
	// Status should be validated in application logic: allowed values are "active", "inactive", "suspended", "deleted"
	Status     string         `gorm:"default:active" json:"status" validate:"oneof=active inactive suspended deleted"`
	LogoURL    string         `json:"logo_url"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type TenantSubscription struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	TenantID   uuid.UUID `gorm:"type:uuid;not null" json:"tenant_id" validate:"required"`
	PlanID     uuid.UUID `gorm:"type:uuid;not null" json:"plan_id" validate:"required"`
	StartDate  time.Time `json:"start_date" validate:"required"`
	ExpiryDate time.Time `json:"expiry_date" validate:"required"`
	// Status should be validated in application logic: allowed values are "active", "inactive", "expired", "cancelled"
	Status     string    `gorm:"default:active" json:"status" validate:"oneof=active inactive expired cancelled"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
