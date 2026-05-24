package services

import (
	"log"

	"github.com/hibiken/asynq"
)

type SchedulerService struct {
	client *asynq.Client
}

func NewSchedulerService(redisURL string) *SchedulerService {
	client := asynq.NewClient(asynq.RedisClientOpt{Addr: redisURL})
	return &SchedulerService{client: client}
}

func (s *SchedulerService) EnqueueTask(typename string, payload []byte) error {
	task := asynq.NewTask(typename, payload)
	info, err := s.client.Enqueue(task)
	if err != nil {
		return err
	}
	log.Printf("Enqueued task: id=%s queue=%s", info.ID, info.Queue)
	return nil
}

func (s *SchedulerService) Close() {
	s.client.Close()
}
