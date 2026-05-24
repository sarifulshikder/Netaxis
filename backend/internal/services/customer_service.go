package services

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/utils"
	"gorm.io/gorm"
)

type CustomerService struct {
	db *gorm.DB
}

func NewCustomerService(db *gorm.DB) *CustomerService {
	return &CustomerService{db: db}
}

func (s *CustomerService) CreateCustomer(data tenant.Customer) (*tenant.Customer, error) {
	data.ID = uuid.New()
	
	// Auto-generate customer code
	var count int64
	s.db.Model(&tenant.Customer{}).Count(&count)
	data.CustomerCode = fmt.Sprintf("CST-%05d", count+1)

	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *CustomerService) ListCustomers(pagination utils.Pagination, search string) (*utils.Pagination, error) {
	var customers []tenant.Customer
	
	query := s.db.Model(&tenant.Customer{})
	if search != "" {
		query = query.Where("name ILIKE ? OR phone ILIKE ? OR customer_code ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	err := query.Count(&pagination.TotalRows).
		Offset(pagination.GetOffset()).
		Limit(pagination.GetLimit()).
		Order(pagination.GetSort()).
		Find(&customers).Error

	pagination.Rows = customers
	return &pagination, err
}

func (s *CustomerService) GetCustomer(id string) (*tenant.Customer, error) {
	var c tenant.Customer
	if err := s.db.First(&c, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (s *CustomerService) UpdateCustomer(id string, data tenant.Customer) (*tenant.Customer, error) {
	if err := s.db.Model(&tenant.Customer{}).Where("id = ?", id).Updates(data).Error; err != nil {
		return nil, err
	}
	return s.GetCustomer(id)
}

func (s *CustomerService) DeleteCustomer(id string) error {
	return s.db.Delete(&tenant.Customer{}, "id = ?", id).Error
}

func (s *CustomerService) GetStatement(customerID string) (map[string]interface{}, error) {
	var invoices []tenant.Invoice
	s.db.Where("customer_id = ?", customerID).Find(&invoices)

	var payments []tenant.Payment
	s.db.Where("customer_id = ?", customerID).Find(&payments)

	var totalInvoiced float64
	for _, inv := range invoices {
		totalInvoiced += inv.TotalAmount
	}

	var totalPaid float64
	for _, p := range payments {
		totalPaid += p.Amount
	}

	return map[string]interface{}{
		"total_invoiced": totalInvoiced,
		"total_paid":     totalPaid,
		"due_amount":     totalInvoiced - totalPaid,
		"invoices":       invoices,
		"payments":       payments,
	}, nil
}
