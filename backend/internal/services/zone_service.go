package services

import (
	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type ZoneService struct {
	db *gorm.DB
}

func NewZoneService(db *gorm.DB) *ZoneService {
	return &ZoneService{db: db}
}

func (s *ZoneService) CreateZone(data tenant.Zone) (*tenant.Zone, error) {
	data.ID = uuid.New()
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *ZoneService) ListZones() ([]tenant.Zone, error) {
	var zones []tenant.Zone
	err := s.db.Find(&zones).Error
	return zones, err
}

func (s *ZoneService) GetZone(id string) (*tenant.Zone, error) {
	var z tenant.Zone
	if err := s.db.First(&z, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &z, nil
}

func (s *ZoneService) UpdateZone(id string, data tenant.Zone) (*tenant.Zone, error) {
	if err := s.db.Model(&tenant.Zone{}).Where("id = ?", id).Updates(data).Error; err != nil {
		return nil, err
	}
	return s.GetZone(id)
}

func (s *ZoneService) DeleteZone(id string) error {
	return s.db.Delete(&tenant.Zone{}, "id = ?", id).Error
}
