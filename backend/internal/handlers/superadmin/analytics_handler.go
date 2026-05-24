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
	var totalTenants int64
	h.db.Model(&public.Tenant{}).Count(&totalTenants)

	var activeTenants int64
	h.db.Model(&public.Tenant{}).Where("status = ?", "active").Count(&activeTenants)

	utils.Success(c, "Platform overview fetched", gin.H{
		"total_tenants":  totalTenants,
		"active_tenants": activeTenants,
	})
}

func (h *AnalyticsHandler) Revenue(c *gin.Context) {
	// Simple mock for platform revenue (subscription billing not fully implemented)
	utils.Success(c, "Platform revenue fetched", gin.H{
		"monthly_recurring_revenue": 50000.00,
		"currency":                  "৳",
	})
}
