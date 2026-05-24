package services

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type BillingService struct {
	db *gorm.DB
}

func NewBillingService(db *gorm.DB) *BillingService {
	return &BillingService{db: db}
}

func (s *BillingService) GenerateMonthlyInvoice(customerID string) (*tenant.Invoice, error) {
	var customer tenant.Customer
	if err := s.db.First(&customer, "id = ?", customerID).Error; err != nil {
		return nil, err
	}

	var connections []tenant.Connection
	s.db.Where("customer_id = ? AND status = ?", customerID, "active").Find(&connections)

	if len(connections) == 0 {
		return nil, fmt.Errorf("no active connections for customer")
	}

	invoiceID := uuid.New()
	var subtotal float64
	var items []tenant.InvoiceItem

	for _, conn := range connections {
		var pkg tenant.Package
		s.db.First(&pkg, "id = ?", conn.PackageID)

		item := tenant.InvoiceItem{
			ID:          uuid.New(),
			InvoiceID:   invoiceID,
			Description: fmt.Sprintf("Internet Service: %s (%s)", pkg.Name, conn.Username),
			Quantity:    1,
			UnitPrice:   pkg.Price,
			TotalPrice:  pkg.Price,
		}
		items = append(items, item)
		subtotal += pkg.Price
	}

	// Get latest invoice count for number
	var count int64
	s.db.Model(&tenant.Invoice{}).Count(&count)

	invoice := tenant.Invoice{
		ID:                 invoiceID,
		CustomerID:         customer.ID,
		InvoiceNo:          fmt.Sprintf("INV-%06d", count+1),
		BillingPeriodStart: time.Now().AddDate(0, 0, -30),
		BillingPeriodEnd:   time.Now(),
		DueDate:            time.Now().AddDate(0, 0, 5),
		Subtotal:           subtotal,
		TotalAmount:        subtotal,
		Status:             "pending",
		Items:              items,
	}

	if err := s.db.Create(&invoice).Error; err != nil {
		return nil, err
	}

	return &invoice, nil
}

func (s *BillingService) BulkGenerate() error {
	var customers []tenant.Customer
	s.db.Find(&customers)

	for _, c := range customers {
		s.GenerateMonthlyInvoice(c.ID.String())
	}
	return nil
}

func (s *BillingService) GetInvoice(id string) (*tenant.Invoice, error) {
	var inv tenant.Invoice
	if err := s.db.Preload("Items").First(&inv, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &inv, nil
}

func (s *BillingService) VoidInvoice(id string) error {
	return s.db.Model(&tenant.Invoice{}).Where("id = ?", id).Update("status", "void").Error
}
