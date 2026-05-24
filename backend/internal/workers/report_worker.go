package workers

import (
	"context"
	"log"

	"github.com/hibiken/asynq"
	"github.com/netaxis/backend/internal/services"
)

const (
	TypeReportGenerate = "report:generate"
)

type ReportWorker struct {
	svc *services.ReportService
}

func NewReportWorker(svc *services.ReportService) *ReportWorker {
	return &ReportWorker{svc: svc}
}

func (w *ReportWorker) ProcessTask(ctx context.Context, t *asynq.Task) error {
	if t.Type() == TypeReportGenerate {
		log.Println("Generating scheduled reports...")
		return nil
	}
	return nil
}
