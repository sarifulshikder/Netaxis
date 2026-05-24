package workers

import (
	"context"
	"log"

	"github.com/hibiken/asynq"
	"github.com/netaxis/backend/internal/services"
)

const (
	TypeMikrotikSync = "mikrotik:sync"
)

type MikrotikSyncWorker struct {
	svc *services.MikrotikService
}

func NewMikrotikSyncWorker(svc *services.MikrotikService) *MikrotikSyncWorker {
	return &MikrotikSyncWorker{svc: svc}
}

func (w *MikrotikSyncWorker) ProcessTask(ctx context.Context, t *asynq.Task) error {
	if t.Type() == TypeMikrotikSync {
		log.Println("Syncing active sessions from MikroTik...")
		return nil
	}
	return nil
}
