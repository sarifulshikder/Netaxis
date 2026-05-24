package services

import (
	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type PaymentService struct {
	db            *gorm.DB
	connectionSvc *ConnectionService
}

func NewPaymentService(db *gorm.DB) *PaymentService {
	return &PaymentService{db: db}
}

func (s *PaymentService) SetConnectionService(c *ConnectionService) {
	s.connectionSvc = c
}

func (s *PaymentService) CreatePayment(data tenant.Payment) (*tenant.Payment, error) {
	data.ID = uuid.New()
	
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Create Payment
		if err := tx.Create(&data).Error; err != nil {
			return err
		}

		// 2. Update Invoice
		var inv tenant.Invoice
		if err := tx.First(&inv, "id = ?", data.InvoiceID).Error; err != nil {
			return err
		}

		inv.PaidAmount += data.Amount
		if inv.PaidAmount >= inv.TotalAmount {
			inv.Status = "paid"
		} else if inv.PaidAmount > 0 {
			inv.Status = "partial"
		}

		if err := tx.Save(&inv).Error; err != nil {
			return err
		}

		// 3. Update Customer Wallet (if overpaid)
		if inv.PaidAmount > inv.TotalAmount {
			overpaid := inv.PaidAmount - inv.TotalAmount
			if err := tx.Model(&tenant.Customer{}).Where("id = ?", data.CustomerID).
				Update("wallet_balance", gorm.Expr("wallet_balance + ?", overpaid)).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// 4. Auto-resume connection if paid
	if s.connectionSvc != nil {
		var connections []tenant.Connection
		s.db.Where("customer_id = ? AND status = ?", data.CustomerID, "suspended").Find(&connections)
		for _, conn := range connections {
			if conn.AutoResume {
				s.connectionSvc.ResumeConnection(conn.ID.String())
			}
		}
	}

	return &data, nil
}

func (s *PaymentService) ReversePayment(id string) error {
	var p tenant.Payment
	if err := s.db.First(&p, "id = ?", id).Error; err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&p).Update("status", "reversed").Error; err != nil {
			return err
		}

		// Update Invoice
		if err := tx.Model(&tenant.Invoice{}).Where("id = ?", p.InvoiceID).
			Update("paid_amount", gorm.Expr("paid_amount - ?", p.Amount)).Error; err != nil {
			return err
		}

		return nil
	})
}
