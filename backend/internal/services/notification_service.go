package services

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type NotificationService struct {
	db       *gorm.DB
	smsSvc   *SMSService
	emailSvc *EmailService
}

func NewNotificationService(db *gorm.DB) *NotificationService {
	return &NotificationService{db: db}
}

func (s *NotificationService) SetSMS(sms *SMSService) {
	s.smsSvc = sms
}

func (s *NotificationService) SetEmail(email *EmailService) {
	s.emailSvc = email
}


func (s *NotificationService) Send(customerID string, eventType string, data map[string]string) error {
	var customer tenant.Customer
	if err := s.db.First(&customer, "id = ?", customerID).Error; err != nil {
		return err
	}

	var template tenant.NotificationTemplate
	if err := s.db.First(&template, "event_type = ?", eventType).Error; err != nil {
		return fmt.Errorf("template not found: %s", eventType)
	}

	if template.SMSContent != "" && customer.Phone != "" {
		msg := s.replacePlaceholders(template.SMSContent, data)
		s.smsSvc.SendSMS(customer.Phone, msg)
		s.logNotification(customer.ID, eventType, customer.Phone, "SMS", "sent", "")
	}

	if template.EmailContent != "" && customer.Email != "" {
		body := s.replacePlaceholders(template.EmailContent, data)
		s.emailSvc.SendEmail(customer.Email, template.EmailSubject, body)
		s.logNotification(customer.ID, eventType, customer.Email, "Email", "sent", "")
	}

	return nil
}

func (s *NotificationService) replacePlaceholders(content string, data map[string]string) string {
	for k, v := range data {
		content = strings.ReplaceAll(content, "{{"+k+"}}", v)
	}
	return content
}

func (s *NotificationService) logNotification(customerID uuid.UUID, eventType, recipient, channel, status, errorMsg string) {
	log := tenant.NotificationLog{
		ID:           uuid.New(),
		CustomerID:   customerID,
		EventType:    eventType,
		Recipient:    recipient,
		Channel:      channel,
		Status:       status,
		ErrorMessage: errorMsg,
	}
	s.db.Create(&log)
}

func (s *NotificationService) ListTemplates() ([]tenant.NotificationTemplate, error) {
	var t []tenant.NotificationTemplate
	err := s.db.Find(&t).Error
	return t, err
}

func (s *NotificationService) UpdateTemplate(id string, data tenant.NotificationTemplate) error {
	return s.db.Model(&tenant.NotificationTemplate{}).Where("id = ?", id).Updates(data).Error
}
