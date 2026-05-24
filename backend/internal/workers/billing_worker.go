package workers

import (
	"context"
	"log"

	"github.com/hibiken/asynq"
	"github.com/netaxis/backend/internal/services"
)

const (
	TypeBillingGenerate = "billing:generate"
)

type BillingWorker struct {
	svc *services.BillingService
}

func NewBillingWorker(svc *services.BillingService) *BillingWorker {
	return &BillingWorker{svc: svc}
}

func (w *BillingWorker) ProcessTask(ctx context.Context, t *asynq.Task) error {
	switch t.Type() {
	case TypeBillingGenerate:
		log.Println("Processing daily billing generation...")
		return w.svc.BulkGenerate()
	}
	return nil
}
