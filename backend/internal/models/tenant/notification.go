package tenant

import (
	"time"

	"github.com/google/uuid"
)

type NotificationTemplate struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	EventType    string    `gorm:"uniqueIndex;not null" json:"event_type"`
	SMSContent   string    `json:"sms_content"`
	EmailContent string    `json:"email_content"`
	EmailSubject string    `json:"email_subject"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
}

type NotificationLog struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID   uuid.UUID `gorm:"type:uuid;not null" json:"customer_id"`
	EventType    string    `json:"event_type"`
	Recipient    string    `json:"-"` // Sensitive, do not expose in JSON
	Channel      string    `json:"channel"` // SMS, Email
	Status       string    `json:"status"`  // sent, failed
	ErrorMessage string    `json:"-"` // Sensitive, do not expose in JSON
	CreatedAt    time.Time `json:"created_at"`
}

type Setting struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Key       string    `gorm:"uniqueIndex;not null" json:"key"`
	Value     string    `json:"-"` // Sensitive, do not expose in JSON
	GroupName string    `json:"group_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
