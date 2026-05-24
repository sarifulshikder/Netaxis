package services

import (
	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type PackageService struct {
	db *gorm.DB
}

func NewPackageService(db *gorm.DB) *PackageService {
	return &PackageService{db: db}
}

func (s *PackageService) CreatePackage(data tenant.Package) (*tenant.Package, error) {
	data.ID = uuid.New()
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *PackageService) ListPackages() ([]tenant.Package, error) {
	var packages []tenant.Package
	err := s.db.Find(&packages).Error
	return packages, err
}

func (s *PackageService) GetPackage(id string) (*tenant.Package, error) {
	var p tenant.Package
	if err := s.db.First(&p, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (s *PackageService) UpdatePackage(id string, data tenant.Package) (*tenant.Package, error) {
	if err := s.db.Model(&tenant.Package{}).Where("id = ?", id).Updates(data).Error; err != nil {
		return nil, err
	}
	return s.GetPackage(id)
}

func (s *PackageService) DeletePackage(id string) error {
	return s.db.Delete(&tenant.Package{}, "id = ?", id).Error
}
