package superadmin

import (
	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/public"
	"github.com/netaxis/backend/internal/utils"
	"gorm.io/gorm"
)

type AnalyticsHandler struct {
	db *gorm.DB
}

func NewAnalyticsHandler(db *gorm.DB) *AnalyticsHandler {
	return &AnalyticsHandler{db: db}
}

func (h *AnalyticsHandler) Overview(c *gin.Context) {
	type Result struct {
		Total        int64
		Active       int64
	}
	var res Result

	// Single query for both counts
	err := h.db.Model(&public.Tenant{}).
		Select("COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'active') AS active").
		Scan(&res).Error
	if err != nil {
		utils.Error(c, 500, "Failed to fetch platform overview", err.Error())
		return
	}

	utils.Success(c, "Platform overview fetched", gin.H{
		"total_tenants":  res.Total,
		"active_tenants": res.Active,
	})
}

func (h *AnalyticsHandler) Revenue(c *gin.Context) {
	// Simple mock for platform revenue (subscription billing not fully implemented)
	utils.Success(c, "Platform revenue fetched", gin.H{
		"monthly_recurring_revenue": 50000.00,
		"currency":                  "৳",
	})
}
