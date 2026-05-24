package tenant

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Ticket struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID  uuid.UUID      `gorm:"type:uuid;not null" json:"customer_id"`
	TicketNo    string         `gorm:"uniqueIndex;not null" json:"ticket_no"`
	Subject     string         `gorm:"not null" json:"subject"`
	Description string         `json:"description"`
	Priority    string         `gorm:"default:medium" json:"priority"`
	Status      string         `gorm:"default:open" json:"status"`
	AssignedTo  *uuid.UUID     `gorm:"type:uuid" json:"assigned_to"`
	Category    string         `json:"category"`
	SLADeadline *time.Time     `json:"sla_deadline"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type TicketComment struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	TicketID  uuid.UUID `gorm:"type:uuid;not null" json:"ticket_id"`
	UserID    uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Comment   string    `gorm:"not null" json:"comment"`
	IsInternal bool      `gorm:"default:false" json:"is_internal"`
	CreatedAt time.Time `json:"created_at"`
}
