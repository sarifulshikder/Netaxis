package tenant

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Ticket struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID  uuid.UUID      `gorm:"type:uuid;not null" json:"customer_id"`
	TicketNo    string         `gorm:"uniqueIndex;not null" json:"ticket_no"` // Consider using a secure/opaque identifier for public exposure. Maps to frontend "ticket_number".
	Subject     string         `gorm:"not null" json:"subject"`
	Description string         `json:"description"`
	Priority    string         `gorm:"default:medium" json:"priority"` // Validate allowed values: low, medium, high, critical.
	Status      string         `gorm:"default:open" json:"status"`     // Validate allowed values: open, in_progress, resolved, closed.
	AssignedTo  *uuid.UUID     `gorm:"type:uuid" json:"assigned_to"`
	Category    string         `json:"category"`                       // Validate allowed values in application logic.
	SLADeadline *time.Time     `json:"sla_deadline"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type TicketComment struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	TicketID  uuid.UUID `gorm:"type:uuid;not null" json:"ticket_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"` // Not null for auditability.
	Comment   string    `gorm:"not null" json:"comment"`           // Sanitize/validate in application logic to prevent XSS.
	IsInternal bool      `gorm:"default:false" json:"is_internal"`
	CreatedAt time.Time `json:"created_at"`
}
