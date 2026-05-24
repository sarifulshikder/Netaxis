package tenant

import (
	"time"

	"github.com/google/uuid"
)

type Staff struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Email       string    `gorm:"uniqueIndex;not null" json:"email"`
	Phone       string    `json:"phone"`
	Role        string    `gorm:"not null" json:"role"`
	Designation string    `json:"designation"`
	Salary      float64   `json:"salary"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type StaffAuth struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	StaffID   uuid.UUID `gorm:"type:uuid;not null" json:"staff_id"`
	Password  string    `gorm:"not null" json:"-"`
	CreatedAt time.Time `json:"created_at"`
}

type StaffAttendance struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	StaffID     uuid.UUID  `gorm:"type:uuid;not null" json:"staff_id"`
	CheckIn     *time.Time `json:"check_in"`
	CheckOut    *time.Time `json:"check_out"`
	LocationIn  string     `json:"location_in"`
	LocationOut string     `json:"location_out"`
	CreatedAt   time.Time  `json:"created_at"`
}

type StaffLeave struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	StaffID   uuid.UUID `gorm:"type:uuid;not null" json:"staff_id"`
	LeaveType string    `json:"leave_type"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	Status    string    `gorm:"default:pending" json:"status"`
	Reason    string    `json:"reason"`
	CreatedAt time.Time `json:"created_at"`
}

type StaffPayroll struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	StaffID       uuid.UUID `gorm:"type:uuid;not null" json:"staff_id"`
	Month         int       `json:"month"`
	Year          int       `json:"year"`
	BasicSalary   float64   `json:"basic_salary"`
	Allowances    float64   `json:"allowances"`
	Deductions    float64   `json:"deductions"`
	NetSalary     float64   `json:"net_salary"`
	PaymentStatus string    `gorm:"default:paid" json:"payment_status"`
	PaidAt        time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"paid_at"`
}

func (Staff) TableName() string             { return "staff" }
func (StaffAuth) TableName() string         { return "staff_auth" }
func (StaffAttendance) TableName() string   { return "staff_attendance" }
func (StaffLeave) TableName() string        { return "staff_leaves" }
func (StaffPayroll) TableName() string      { return "staff_payroll" }
