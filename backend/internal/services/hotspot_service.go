package services

import (
	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/utils"
	"gorm.io/gorm"
)

type HotspotService struct {
	db *gorm.DB
}

func NewHotspotService(db *gorm.DB) *HotspotService {
	return &HotspotService{db: db}
}

func (s *HotspotService) CreateProfile(data tenant.HotspotProfile) (*tenant.HotspotProfile, error) {
	data.ID = uuid.New()
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *HotspotService) GenerateVouchers(profileID string, quantity int, batchName string) ([]tenant.HotspotVoucher, error) {
	var profile tenant.HotspotProfile
	if err := s.db.First(&profile, "id = ?", profileID).Error; err != nil {
		return nil, err
	}

	var vouchers []tenant.HotspotVoucher
	for i := 0; i < quantity; i++ {
		v := tenant.HotspotVoucher{
			ID:        uuid.New(),
			ProfileID: profile.ID,
			Code:      utils.RandomString(8),
			BatchName: batchName,
			Status:    "available",
		}
		vouchers = append(vouchers, v)
	}

	if err := s.db.Create(&vouchers).Error; err != nil {
		return nil, err
	}

	return vouchers, nil
}

func (s *HotspotService) ListVouchers(batchName string) ([]tenant.HotspotVoucher, error) {
	var vouchers []tenant.HotspotVoucher
	query := s.db.Model(&tenant.HotspotVoucher{})
	if batchName != "" {
		query = query.Where("batch_name = ?", batchName)
	}
	err := query.Find(&vouchers).Error
	return vouchers, err
}

func (s *HotspotService) ListProfiles() ([]tenant.HotspotProfile, error) {
	var profiles []tenant.HotspotProfile
	err := s.db.Find(&profiles).Error
	return profiles, err
}

func (s *HotspotService) ListSessions() ([]tenant.HotspotSession, error) {
	var sessions []tenant.HotspotSession
	err := s.db.Find(&sessions).Error
	return sessions, err
}
