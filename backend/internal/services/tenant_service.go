package services

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/database"
	"github.com/netaxis/backend/internal/models/public"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/utils"
	"gorm.io/gorm"
)

type TenantService struct {
	db *gorm.DB
}

func NewTenantService(db *gorm.DB) *TenantService {
	return &TenantService{db: db}
}

func (s *TenantService) CreateTenant(data public.Tenant, adminPassword string, planID string) (*public.Tenant, error) {
	data.ID = uuid.New()
	safeSlug := strings.ReplaceAll(utils.Slugify(data.Slug), "-", "_")
	data.SchemaName = fmt.Sprintf("tenant_%s", safeSlug)
	data.Status = "active"

	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}

	// Create subscription
	pUUID, _ := uuid.Parse(planID)
	sub := public.TenantSubscription{
		ID:         uuid.New(),
		TenantID:   data.ID,
		PlanID:     pUUID,
		StartDate:  time.Now(),
		ExpiryDate: time.Now().AddDate(0, 1, 0), // 1 month trial/default
		Status:     "active",
	}
	if err := s.db.Create(&sub).Error; err != nil {
		return nil, fmt.Errorf("failed to create subscription: %v", err)
	}

	// Create physical schema and run migrations
	if err := database.CreateTenantSchema(s.db, data.SchemaName); err != nil {
		return nil, fmt.Errorf("failed to create schema: %v", err)
	}

	// Create initial staff admin for the tenant
	tenantDB := database.GetTenantDB(s.db, data.SchemaName)
	staff := tenant.Staff{
		ID:    uuid.New(),
		Name:  data.OwnerName,
		Email: data.Email,
		Role:  "admin",
	}

	if err := tenantDB.Create(&staff).Error; err != nil {
		return nil, fmt.Errorf("failed to create initial staff: %v", err)
	}

	hashedPassword, _ := utils.HashPassword(adminPassword)
	staffAuth := tenant.StaffAuth{
		ID:       uuid.New(),
		StaffID:  staff.ID,
		Password: hashedPassword,
	}

	if err := tenantDB.Create(&staffAuth).Error; err != nil {
		return nil, fmt.Errorf("failed to create staff auth: %v", err)
	}

	return &data, nil
}

func (s *TenantService) ListTenants() ([]public.Tenant, error) {
	var tenants []public.Tenant
	err := s.db.Find(&tenants).Error
	return tenants, err
}

func (s *TenantService) GetTenant(id string) (*public.Tenant, error) {
	var t public.Tenant
	if err := s.db.First(&t, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

func (s *TenantService) UpdateTenant(id string, data public.Tenant) (*public.Tenant, error) {
	if err := s.db.Model(&public.Tenant{}).Where("id = ?", id).Updates(data).Error; err != nil {
		return nil, err
	}
	return s.GetTenant(id)
}

func (s *TenantService) SuspendTenant(id string) error {
	return s.db.Model(&public.Tenant{}).Where("id = ?", id).Update("status", "suspended").Error
}

func (s *TenantService) ActivateTenant(id string) error {
	return s.db.Model(&public.Tenant{}).Where("id = ?", id).Update("status", "active").Error
}

func (s *TenantService) ListPlans() ([]public.SubscriptionPlan, error) {
	var plans []public.SubscriptionPlan
	err := s.db.Find(&plans).Error
	return plans, err
}

func (s *TenantService) CreatePlan(data public.SubscriptionPlan) (*public.SubscriptionPlan, error) {
	data.ID = uuid.New()
	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *TenantService) UpdatePlan(id string, data public.SubscriptionPlan) (*public.SubscriptionPlan, error) {
	if err := s.db.Model(&public.SubscriptionPlan{}).Where("id = ?", id).Updates(data).Error; err != nil {
		return nil, err
	}
	var p public.SubscriptionPlan
	s.db.First(&p, "id = ?", id)
	return &p, nil
}

func (s *TenantService) DeletePlan(id string) error {
	return s.db.Delete(&public.SubscriptionPlan{}, "id = ?", id).Error
}

func (s *TenantService) GetTenantStats(schema string) (map[string]interface{}, error) {
	tenantDB := database.GetTenantDB(s.db, schema)
	
	var customerCount int64
	tenantDB.Model(&tenant.Customer{}).Count(&customerCount)

	var connectionCount int64
	tenantDB.Model(&tenant.Connection{}).Count(&connectionCount)

	var revenue float64
	tenantDB.Model(&tenant.Payment{}).Select("SUM(amount)").Scan(&revenue)

	return map[string]interface{}{
		"customers":   customerCount,
		"connections": connectionCount,
		"revenue":     revenue,
	}, nil
}
