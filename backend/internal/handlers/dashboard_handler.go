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
	roleVal, exists := c.Get("role")
	if !exists {
		utils.Error(c, 401, "Role not found in context", nil)
		return
	}
	role, ok := roleVal.(string)
	if !ok {
		utils.Error(c, 400, "Invalid role type", nil)
		return
	}

	if role == "superadmin" {
		var totalTenants, activeTenants, trialTenants int64
		if err := h.db.Table("tenants").Count(&totalTenants).Error; err != nil {
			utils.Error(c, 500, "Failed to fetch total tenants", err.Error())
			return
		}
		if err := h.db.Table("tenants").Where("status = ?", "active").Count(&activeTenants).Error; err != nil {
			utils.Error(c, 500, "Failed to fetch active tenants", err.Error())
			return
		}
		if err := h.db.Table("tenants").Where("status = ?", "trial").Count(&trialTenants).Error; err != nil {
			utils.Error(c, 500, "Failed to fetch trial tenants", err.Error())
			return
		}
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
	tdb, ok := dbVal.(*gorm.DB)
	if !ok || tdb == nil {
		utils.Error(c, 500, "Invalid database context", nil)
		return
	}

	var totalCust, activeCust, inactiveCust, suspendedCust, activeConns, pendingTickets int64
	var monthlyRevenue, totalDue float64

	if err := tdb.Table("customers").Count(&totalCust).Error; err != nil {
		utils.Error(c, 500, "Failed to fetch total customers", err.Error())
		return
	}
	if err := tdb.Table("customers").Where("status = ?", "active").Count(&activeCust).Error; err != nil {
		utils.Error(c, 500, "Failed to fetch active customers", err.Error())
		return
	}
	if err := tdb.Table("customers").Where("status = ?", "inactive").Count(&inactiveCust).Error; err != nil {
		utils.Error(c, 500, "Failed to fetch inactive customers", err.Error())
		return
	}
	if err := tdb.Table("customers").Where("status = ?", "suspended").Count(&suspendedCust).Error; err != nil {
		utils.Error(c, 500, "Failed to fetch suspended customers", err.Error())
		return
	}
	if err := tdb.Table("connections").Where("status = ?", "active").Count(&activeConns).Error; err != nil {
		utils.Error(c, 500, "Failed to fetch active connections", err.Error())
		return
	}
	if err := tdb.Table("tickets").Where("status = ?", "open").Count(&pendingTickets).Error; err != nil {
		utils.Error(c, 500, "Failed to fetch pending tickets", err.Error())
		return
	}
	if err := tdb.Table("payments").Select("COALESCE(SUM(amount), 0)").Scan(&monthlyRevenue).Error; err != nil {
		utils.Error(c, 500, "Failed to fetch monthly revenue", err.Error())
		return
	}
	if err := tdb.Table("invoices").Where("status != ?", "paid").Select("COALESCE(SUM(total_amount - paid_amount), 0)").Scan(&totalDue).Error; err != nil {
		utils.Error(c, 500, "Failed to fetch total due", err.Error())
		return
	}

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
