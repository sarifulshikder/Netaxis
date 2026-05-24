package services

import (
	"fmt"

	"github.com/go-routeros/routeros"
	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type MikrotikService struct {
	db *gorm.DB
}

func NewMikrotikService(db *gorm.DB) *MikrotikService {
	return &MikrotikService{db: db}
}

func (s *MikrotikService) Connect(router tenant.Router) (*routeros.Client, error) {
	address := fmt.Sprintf("%s:%d", router.Host, router.Port)
	client, err := routeros.Dial(address, router.Username, router.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MikroTik at %s: %v", address, err)
	}
	return client, nil
}

func (s *MikrotikService) TestConnection(router tenant.Router) error {
	client, err := s.Connect(router)
	if err != nil {
		return err
	}
	defer client.Close()
	return nil
}

func (s *MikrotikService) CreatePPPoEUser(router tenant.Router, username, password, profile string) error {
	client, err := s.Connect(router)
	if err != nil {
		return err
	}
	defer client.Close()

	_, err = client.Run("/ppp/secret/add", "=name="+username, "=password="+password, "=profile="+profile, "=service=pppoe")
	return err
}

func (s *MikrotikService) DeletePPPoEUser(router tenant.Router, username string) error {
	client, err := s.Connect(router)
	if err != nil {
		return err
	}
	defer client.Close()

	// Find the ID first or use name if supported
	_, err = client.Run("/ppp/secret/remove", "=.id="+username)
	return err
}

func (s *MikrotikService) SuspendUser(router tenant.Router, username string) error {
	client, err := s.Connect(router)
	if err != nil {
		return err
	}
	defer client.Close()

	// Option 1: Disable secret
	_, err = client.Run("/ppp/secret/disable", "=.id="+username)
	
	// Option 2: Terminate active session
	client.Run("/ppp/active/remove", "=.id="+username)

	return err
}

func (s *MikrotikService) ResumeUser(router tenant.Router, username string) error {
	client, err := s.Connect(router)
	if err != nil {
		return err
	}
	defer client.Close()

	_, err = client.Run("/ppp/secret/enable", "=.id="+username)
	return err
}

func (s *MikrotikService) ChangeUserSpeed(router tenant.Router, username, profile string) error {
	client, err := s.Connect(router)
	if err != nil {
		return err
	}
	defer client.Close()

	_, err = client.Run("/ppp/secret/set", "=.id="+username, "=profile="+profile)
	return err
}

func (s *MikrotikService) GetActiveSessions(router tenant.Router) ([]map[string]string, error) {
	client, err := s.Connect(router)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	res, err := client.Run("/ppp/active/print")
	if err != nil {
		return nil, err
	}

	var sessions []map[string]string
	for _, re := range res.Re {
		sessions = append(sessions, re.Map)
	}
	return sessions, nil
}

func (s *MikrotikService) GetRouterResources(router tenant.Router) (map[string]string, error) {
	client, err := s.Connect(router)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	res, err := client.Run("/system/resource/print")
	if err != nil {
		return nil, err
	}

	if len(res.Re) > 0 {
		return res.Re[0].Map, nil
	}
	return nil, fmt.Errorf("no resources found")
}
