package services

import (
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type SettingsService struct {
	db *gorm.DB
}

func NewSettingsService(db *gorm.DB) *SettingsService {
	return &SettingsService{db: db}
}

func (s *SettingsService) GetAll() (map[string]string, error) {
	var settings []tenant.Setting
	if err := s.db.Find(&settings).Error; err != nil {
		return nil, err
	}

	res := make(map[string]string)
	for _, st := range settings {
		res[st.Key] = st.Value
	}
	return res, nil
}

func (s *SettingsService) Get(key string) string {
	var st tenant.Setting
	s.db.First(&st, "key = ?", key)
	return st.Value
}

func (s *SettingsService) Update(key, value string) error {
	return s.db.Model(&tenant.Setting{}).Where("key = ?", key).Update("value", value).Error
}

func (s *SettingsService) UpdateBulk(data map[string]string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		for k, v := range data {
			if err := tx.Model(&tenant.Setting{}).Where("key = ?", k).Update("value", v).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
