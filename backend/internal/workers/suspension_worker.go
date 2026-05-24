package workers

import (
	"context"
	"log"

	"github.com/hibiken/asynq"
	"github.com/netaxis/backend/internal/services"
)

const (
	TypeAutoSuspend = "billing:auto_suspend"
)

type SuspensionWorker struct {
	svc *services.ConnectionService
}

func NewSuspensionWorker(svc *services.ConnectionService) *SuspensionWorker {
	return &SuspensionWorker{svc: svc}
}

func (w *SuspensionWorker) ProcessTask(ctx context.Context, t *asynq.Task) error {
	if t.Type() == TypeAutoSuspend {
		log.Println("Processing auto suspension for overdue accounts...")
		// Implementation would find overdue accounts and call w.svc.SuspendConnection
		return nil
	}
	return nil
}
