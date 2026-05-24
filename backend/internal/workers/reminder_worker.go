package workers

import (
	"context"
	"log"

	"github.com/hibiken/asynq"
	"github.com/netaxis/backend/internal/services"
)

const (
	TypeReminderSend = "notification:reminder"
)

type ReminderWorker struct {
	svc *services.NotificationService
}

func NewReminderWorker(svc *services.NotificationService) *ReminderWorker {
	return &ReminderWorker{svc: svc}
}

func (w *ReminderWorker) ProcessTask(ctx context.Context, t *asynq.Task) error {
	if t.Type() == TypeReminderSend {
		log.Println("Processing bill reminders...")
		return nil
	}
	return nil
}
