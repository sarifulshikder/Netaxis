package services

import (
	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type InventoryService struct {
	db *gorm.DB
}

func NewInventoryService(db *gorm.DB) *InventoryService {
	return &InventoryService{db: db}
}

func (s *InventoryService) CreateItem(data tenant.InventoryItem) (*tenant.InventoryItem, error) {
	data.ID = uuid.New()
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *InventoryService) StockIn(itemID string, quantity int, unitPrice float64, vendorID string) error {
	itemUUID, _ := uuid.Parse(itemID)
	var vendorUUID *uuid.UUID
	if vendorID != "" {
		v, _ := uuid.Parse(vendorID)
		vendorUUID = &v
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		tx.Model(&tenant.InventoryItem{}).Where("id = ?", itemID).Update("current_stock", gorm.Expr("current_stock + ?", quantity))
		
		tx.Create(&tenant.InventoryTransaction{
			ID:              uuid.New(),
			ItemID:          itemUUID,
			TransactionType: "stock_in",
			Quantity:        quantity,
			UnitPrice:       unitPrice,
			VendorID:        vendorUUID,
		})
		return nil
	})
}

func (s *InventoryService) AssignDevice(data tenant.DeviceAssignment) (*tenant.DeviceAssignment, error) {
	data.ID = uuid.New()
	data.Status = "active"

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&data).Error; err != nil {
			return err
		}
		return tx.Model(&tenant.InventoryItem{}).Where("id = ?", data.ItemID).Update("current_stock", gorm.Expr("current_stock - 1")).Error
	})

	if err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *InventoryService) ListItems() ([]tenant.InventoryItem, error) {
	var items []tenant.InventoryItem
	err := s.db.Preload("CategoryID").Find(&items).Error
	return items, err
}

func (s *InventoryService) ListVendors() ([]tenant.Vendor, error) {
	var vendors []tenant.Vendor
	err := s.db.Find(&vendors).Error
	return vendors, err
}

func (s *InventoryService) CreateVendor(data tenant.Vendor) (*tenant.Vendor, error) {
	data.ID = uuid.New()
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *InventoryService) ListTransactions() ([]tenant.InventoryTransaction, error) {
	var txs []tenant.InventoryTransaction
	err := s.db.Find(&txs).Error
	return txs, err
}

func (s *InventoryService) ListAssignments() ([]tenant.DeviceAssignment, error) {
	var as []tenant.DeviceAssignment
	err := s.db.Find(&as).Error
	return as, err
}

func (s *InventoryService) ReturnDevice(id string) error {
	var as tenant.DeviceAssignment
	if err := s.db.First(&as, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Transaction(func(tx *gorm.DB) error {
		tx.Model(&as).Update("status", "returned")
		return tx.Model(&tenant.InventoryItem{}).Where("id = ?", as.ItemID).Update("current_stock", gorm.Expr("current_stock + 1")).Error
	})
}
