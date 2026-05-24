package services

import (
	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/utils"
	"gorm.io/gorm"
)

type ResellerService struct {
	db *gorm.DB
}

func NewResellerService(db *gorm.DB) *ResellerService {
	return &ResellerService{db: db}
}

func (s *ResellerService) CreateReseller(data tenant.Reseller, password string) (*tenant.Reseller, error) {
	data.ID = uuid.New()
	
	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&data).Error; err != nil {
			return err
		}

		hashedPassword, _ := utils.HashPassword(password)
		auth := tenant.ResellerAuth{
			ID:         uuid.New(),
			ResellerID: data.ID,
			Password:   hashedPassword,
		}
		return tx.Create(&auth).Error
	})

	if err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *ResellerService) WalletTopup(resellerID string, amount float64, description string) error {
	var r tenant.Reseller
	if err := s.db.First(&r, "id = ?", resellerID).Error; err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		newBalance := r.WalletBalance + amount
		if err := tx.Model(&r).Update("wallet_balance", newBalance).Error; err != nil {
			return err
		}

		tx.Create(&tenant.ResellerTransaction{
			ID:              uuid.New(),
			ResellerID:      r.ID,
			TransactionType: "credit",
			Amount:          amount,
			BalanceAfter:    newBalance,
			Description:     description,
		})
		return nil
	})
}

func (s *ResellerService) ListResellers() ([]tenant.Reseller, error) {
	var resellers []tenant.Reseller
	err := s.db.Find(&resellers).Error
	return resellers, err
}

func (s *ResellerService) GetTransactions(resellerID string) ([]tenant.ResellerTransaction, error) {
	var txs []tenant.ResellerTransaction
	err := s.db.Where("reseller_id = ?", resellerID).Order("created_at desc").Find(&txs).Error
	return txs, err
}
