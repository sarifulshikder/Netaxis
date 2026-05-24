package services

import (
	"time"

	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/utils"
	"gorm.io/gorm"
)

type StaffService struct {
	db *gorm.DB
}

func NewStaffService(db *gorm.DB) *StaffService {
	return &StaffService{db: db}
}

func (s *StaffService) CreateStaff(data tenant.Staff, password string) (*tenant.Staff, error) {
	data.ID = uuid.New()
	
	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&data).Error; err != nil {
			return err
		}

		hashedPassword, _ := utils.HashPassword(password)
		auth := tenant.StaffAuth{
			ID:       uuid.New(),
			StaffID:  data.ID,
			Password: hashedPassword,
		}
		return tx.Create(&auth).Error
	})

	if err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *StaffService) CheckIn(staffID string, location string) error {
	staffUUID, _ := uuid.Parse(staffID)
	now := time.Now()
	attendance := tenant.StaffAttendance{
		ID:         uuid.New(),
		StaffID:    staffUUID,
		CheckIn:    &now,
		LocationIn: location,
	}
	return s.db.Create(&attendance).Error
}

func (s *StaffService) CheckOut(staffID string, location string) error {
	var attendance tenant.StaffAttendance
	err := s.db.Where("staff_id = ? AND check_out IS NULL", staffID).Order("created_at desc").First(&attendance).Error
	if err != nil {
		return err
	}
	now := time.Now()
	attendance.CheckOut = &now
	attendance.LocationOut = location
	return s.db.Save(&attendance).Error
}

func (s *StaffService) ListStaff() ([]tenant.Staff, error) {
	var staff []tenant.Staff
	err := s.db.Find(&staff).Error
	return staff, err
}

func (s *StaffService) ListAttendance(staffID string) ([]tenant.StaffAttendance, error) {
	var attendance []tenant.StaffAttendance
	query := s.db.Model(&tenant.StaffAttendance{})
	if staffID != "" {
		query = query.Where("staff_id = ?", staffID)
	}
	err := query.Find(&attendance).Error
	return attendance, err
}
