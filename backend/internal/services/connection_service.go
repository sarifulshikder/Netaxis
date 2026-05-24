package services

import (
	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type ConnectionService struct {
	db          *gorm.DB
	mikrotikSvc *MikrotikService
}

func NewConnectionService(db *gorm.DB) *ConnectionService {
	return &ConnectionService{db: db}
}

// SetMikrotikService is used to break circular dependency if any or just for initialization
func (s *ConnectionService) SetMikrotikService(m *MikrotikService) {
	s.mikrotikSvc = m
}

func (s *ConnectionService) CreateConnection(data tenant.Connection) (*tenant.Connection, error) {
	data.ID = uuid.New()
	data.Status = "active"

	if err := s.db.Create(&data).Error; err != nil {
		return nil, err
	}

	// Sync with MikroTik
	if s.mikrotikSvc != nil {
		var pkg tenant.Package
		s.db.First(&pkg, "id = ?", data.PackageID)
		
		var router tenant.Router
		s.db.First(&router, "id = ?", data.RouterID)

		err := s.mikrotikSvc.CreatePPPoEUser(router, data.Username, data.Password, pkg.MikrotikProfile)
		if err != nil {
			// In production, we might want to rollback or mark as "sync_failed"
			return &data, err
		}
	}

	return &data, nil
}

func (s *ConnectionService) SuspendConnection(id string) error {
	var conn tenant.Connection
	if err := s.db.First(&conn, "id = ?", id).Error; err != nil {
		return err
	}

	if err := s.db.Model(&conn).Update("status", "suspended").Error; err != nil {
		return err
	}

	if s.mikrotikSvc != nil {
		var router tenant.Router
		s.db.First(&router, "id = ?", conn.RouterID)
		return s.mikrotikSvc.SuspendUser(router, conn.Username)
	}
	return nil
}

func (s *ConnectionService) ResumeConnection(id string) error {
	var conn tenant.Connection
	if err := s.db.First(&conn, "id = ?", id).Error; err != nil {
		return err
	}

	if err := s.db.Model(&conn).Update("status", "active").Error; err != nil {
		return err
	}

	if s.mikrotikSvc != nil {
		var router tenant.Router
		s.db.First(&router, "id = ?", conn.RouterID)
		return s.mikrotikSvc.ResumeUser(router, conn.Username)
	}
	return nil
}

func (s *ConnectionService) ChangeSpeed(id string, newPackageID string) error {
	var conn tenant.Connection
	if err := s.db.First(&conn, "id = ?", id).Error; err != nil {
		return err
	}

	var pkg tenant.Package
	if err := s.db.First(&pkg, "id = ?", newPackageID).Error; err != nil {
		return err
	}

	if err := s.db.Model(&conn).Update("package_id", newPackageID).Error; err != nil {
		return err
	}

	if s.mikrotikSvc != nil {
		var router tenant.Router
		s.db.First(&router, "id = ?", conn.RouterID)
		return s.mikrotikSvc.ChangeUserSpeed(router, conn.Username, pkg.MikrotikProfile)
	}
	return nil
}

func (s *ConnectionService) ListConnections() ([]tenant.Connection, error) {
	var connections []tenant.Connection
	err := s.db.Find(&connections).Error
	return connections, err
}

func (s *ConnectionService) GetConnection(id string) (*tenant.Connection, error) {
	var c tenant.Connection
	if err := s.db.First(&c, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (s *ConnectionService) DeleteConnection(id string) error {
	var conn tenant.Connection
	s.db.First(&conn, "id = ?", id)
	
	if s.mikrotikSvc != nil {
		var router tenant.Router
		s.db.First(&router, "id = ?", conn.RouterID)
		s.mikrotikSvc.DeletePPPoEUser(router, conn.Username)
	}

	return s.db.Delete(&tenant.Connection{}, "id = ?", id).Error
}
