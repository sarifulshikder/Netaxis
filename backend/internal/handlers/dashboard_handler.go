package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/utils"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	db *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

func (h *DashboardHandler) GetStats(c *gin.Context) {
	role, _ := c.Get("role")

	if role == "superadmin" {
		var totalTenants, activeTenants, trialTenants int64
		h.db.Table("tenants").Count(&totalTenants)
		h.db.Table("tenants").Where("status = ?", "active").Count(&activeTenants)
		h.db.Table("tenants").Where("status = ?", "trial").Count(&trialTenants)
		utils.Success(c, "Dashboard stats fetched", gin.H{
			"total_tenants":   totalTenants,
			"active_tenants":  activeTenants,
			"trial_tenants":   trialTenants,
			"currency_symbol": "৳",
		})
		return
	}

	dbVal, exists := c.Get("db")
	if !exists {
		utils.Error(c, 400, "Database context not found", nil)
		return
	}
	tdb := dbVal.(*gorm.DB)

	var totalCust, activeCust, inactiveCust, suspendedCust, activeConns, pendingTickets int64
	var monthlyRevenue, totalDue float64

	tdb.Table("customers").Count(&totalCust)
	tdb.Table("customers").Where("status = ?", "active").Count(&activeCust)
	tdb.Table("customers").Where("status = ?", "inactive").Count(&inactiveCust)
	tdb.Table("customers").Where("status = ?", "suspended").Count(&suspendedCust)
	tdb.Table("connections").Where("status = ?", "active").Count(&activeConns)
	tdb.Table("tickets").Where("status = ?", "open").Count(&pendingTickets)
	tdb.Table("payments").Select("COALESCE(SUM(amount), 0)").Scan(&monthlyRevenue)
	tdb.Table("invoices").Where("status != ?", "paid").Select("COALESCE(SUM(total_amount - paid_amount), 0)").Scan(&totalDue)

	utils.Success(c, "Dashboard stats fetched", gin.H{
		"total_customers":     totalCust,
		"active_customers":    activeCust,
		"inactive_customers":  inactiveCust,
		"suspended_customers": suspendedCust,
		"active_connections":  activeConns,
		"pending_tickets":     pendingTickets,
		"monthly_revenue":     monthlyRevenue,
		"total_due":           totalDue,
		"currency_symbol":     "৳",
	})
}
