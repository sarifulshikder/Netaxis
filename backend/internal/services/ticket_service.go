package services

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type TicketService struct {
	db *gorm.DB
}

func NewTicketService(db *gorm.DB) *TicketService {
	return &TicketService{db: db}
}

func (s *TicketService) CreateTicket(data tenant.Ticket) (*tenant.Ticket, error) {
	data.ID = uuid.New()
	
	var count int64
	s.db.Model(&tenant.Ticket{}).Count(&count)
	data.TicketNo = fmt.Sprintf("TKT-%05d", count+1)
	
	data.Status = "open"
	
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *TicketService) AssignTicket(id string, staffID string) error {
	staffUUID, err := uuid.Parse(staffID)
	if err != nil {
		return err
	}
	return s.db.Model(&tenant.Ticket{}).Where("id = ?", id).Updates(map[string]interface{}{
		"assigned_to": &staffUUID,
		"status":      "in-progress",
	}).Error
}

func (s *TicketService) AddComment(data tenant.TicketComment) (*tenant.TicketComment, error) {
	data.ID = uuid.New()
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *TicketService) CloseTicket(id string) error {
	return s.db.Model(&tenant.Ticket{}).Where("id = ?", id).Update("status", "closed").Error
}

func (s *TicketService) ListTickets() ([]tenant.Ticket, error) {
	var tickets []tenant.Ticket
	err := s.db.Order("created_at desc").Find(&tickets).Error
	return tickets, err
}

func (s *TicketService) GetTicket(id string) (*tenant.Ticket, error) {
	var t tenant.Ticket
	if err := s.db.Preload("Comments").First(&t, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &t, nil
}
