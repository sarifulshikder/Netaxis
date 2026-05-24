package services

import (
	"time"

	"github.com/netaxis/backend/internal/models/tenant"
	"gorm.io/gorm"
)

type ReportService struct {
	db *gorm.DB
}

func NewReportService(db *gorm.DB) *ReportService {
	return &ReportService{db: db}
}

func (s *ReportService) RevenueReport(start, end time.Time) (map[string]interface{}, error) {
	var totalRevenue float64
	s.db.Model(&tenant.Payment{}).
		Where("payment_date BETWEEN ? AND ? AND status = ?", start, end, "completed").
		Select("SUM(amount)").Scan(&totalRevenue)

	var daily []map[string]interface{}
	s.db.Model(&tenant.Payment{}).
		Select("DATE(payment_date) as date, SUM(amount) as amount").
		Where("payment_date BETWEEN ? AND ? AND status = ?", start, end, "completed").
		Group("DATE(payment_date)").
		Order("date").
		Scan(&daily)

	return map[string]interface{}{
		"total_revenue": totalRevenue,
		"daily":         daily,
	}, nil
}

func (s *ReportService) CustomerReport() (map[string]interface{}, error) {
	var total int64
	s.db.Model(&tenant.Customer{}).Count(&total)

	var active int64
	s.db.Model(&tenant.Customer{}).Where("status = ?", "active").Count(&active)

	var suspended int64
	s.db.Model(&tenant.Customer{}).Where("status = ?", "suspended").Count(&suspended)

	return map[string]interface{}{
		"total_customers":     total,
		"active_customers":    active,
		"suspended_customers": suspended,
	}, nil
}

func (s *ReportService) OutstandingReport() ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	s.db.Model(&tenant.Invoice{}).
		Select("customer_id, SUM(total_amount - paid_amount) as due_amount").
		Where("status IN ?", []string{"pending", "partial", "overdue"}).
		Group("customer_id").
		Scan(&results)
	return results, nil
}
