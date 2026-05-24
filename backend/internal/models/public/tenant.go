package public

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Tenant struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name       string         `gorm:"not null" json:"name"`
	Slug       string         `gorm:"uniqueIndex;not null" json:"slug"`
	Email      string         `gorm:"uniqueIndex;not null" json:"email"`
	Phone      string         `json:"phone"`
	OwnerName  string         `json:"owner_name"`
	Address    string         `json:"address"`
	SchemaName string         `gorm:"uniqueIndex;not null" json:"schema_name"`
	Status     string         `gorm:"default:active" json:"status"`
	LogoURL    string         `json:"logo_url"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type TenantSubscription struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	TenantID   uuid.UUID `gorm:"type:uuid;not null" json:"tenant_id"`
	PlanID     uuid.UUID `gorm:"type:uuid;not null" json:"plan_id"`
	StartDate  time.Time `json:"start_date"`
	ExpiryDate time.Time `json:"expiry_date"`
	Status     string    `gorm:"default:active" json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
