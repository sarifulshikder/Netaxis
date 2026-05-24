package router

import (
	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/config"
	"github.com/netaxis/backend/internal/handlers"
	superadminH "github.com/netaxis/backend/internal/handlers/superadmin"
	tenantH "github.com/netaxis/backend/internal/handlers/tenant"
	"github.com/netaxis/backend/internal/middleware"
	"gorm.io/gorm"
)

type SuperadminHandlers struct {
	Tenant    *superadminH.TenantHandler
	Plan      *superadminH.PlanHandler
	Analytics *superadminH.AnalyticsHandler
}

type TenantHandlers struct {
	Customer     *tenantH.CustomerHandler
	Connection   *tenantH.ConnectionHandler
	Package      *tenantH.PackageHandler
	Invoice      *tenantH.InvoiceHandler
	Payment      *tenantH.PaymentHandler
	Router       *tenantH.RouterHandler
	Hotspot      *tenantH.HotspotHandler
	Ticket       *tenantH.TicketHandler
	Inventory    *tenantH.InventoryHandler
	Staff        *tenantH.StaffHandler
	Zone         *tenantH.ZoneHandler
	Reseller     *tenantH.ResellerHandler
	Accounting   *tenantH.AccountingHandler
	Report       *tenantH.ReportHandler
	Notification *tenantH.NotificationHandler
	Settings     *tenantH.SettingsHandler
}

func SetupRouter(cfg *config.Config, db *gorm.DB, authH *handlers.AuthHandler, dashH *handlers.DashboardHandler, sa *SuperadminHandlers, th *TenantHandlers) *gin.Engine {
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(middleware.Logger())
	r.Use(middleware.CORSMiddleware(cfg.FrontendURL))
	r.Use(gin.Recovery())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "version": "2.0", "service": "NETAXIS"})
	})

	api := r.Group("/api/v1")

	// Public
	api.POST("/auth/login", authH.Login)
	api.POST("/auth/refresh", authH.RefreshToken)
	api.POST("/auth/forgot-password", authH.ForgotPassword)
	api.POST("/auth/reset-password", authH.ResetPassword)

	// Protected
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		protected.POST("/auth/logout", authH.Logout)
		protected.GET("/auth/me", authH.Me)
		protected.GET("/dashboard/stats", dashH.GetStats)

		// Super Admin
		sa_grp := protected.Group("/superadmin")
		sa_grp.Use(middleware.RequireRole("superadmin"))
		{
			sa_grp.GET("/tenants", sa.Tenant.List)
			sa_grp.POST("/tenants", sa.Tenant.Create)
			sa_grp.GET("/tenants/:id", sa.Tenant.Get)
			sa_grp.PUT("/tenants/:id", sa.Tenant.Update)
			sa_grp.DELETE("/tenants/:id", sa.Tenant.Delete)
			sa_grp.POST("/tenants/:id/activate", sa.Tenant.Activate)
			sa_grp.POST("/tenants/:id/suspend", sa.Tenant.Suspend)
			sa_grp.GET("/plans", sa.Plan.List)
			sa_grp.POST("/plans", sa.Plan.Create)
			sa_grp.PUT("/plans/:id", sa.Plan.Update)
			sa_grp.DELETE("/plans/:id", sa.Plan.Delete)
			sa_grp.GET("/analytics/overview", sa.Analytics.Overview)
			sa_grp.GET("/analytics/revenue", sa.Analytics.Revenue)
		}

		// Tenant (ISP Admin/Staff)
		t := protected.Group("")
		t.Use(middleware.TenantMiddleware(db))
		{
			// Customers
			t.GET("/customers", th.Customer.List)
			t.POST("/customers", th.Customer.Create)
			t.GET("/customers/:id", th.Customer.Get)
			t.PUT("/customers/:id", th.Customer.Update)
			t.DELETE("/customers/:id", th.Customer.Delete)
			t.GET("/customers/:id/statement", th.Customer.Statement)
			t.GET("/customers/:id/history", th.Customer.History)
			t.POST("/customers/import", th.Customer.Import)
			t.GET("/customers/export", th.Customer.Export)

			// Connections
			t.GET("/connections", th.Connection.List)
			t.POST("/connections", th.Connection.Create)
			t.GET("/connections/:id", th.Connection.Get)
			t.PUT("/connections/:id", th.Connection.Update)
			t.DELETE("/connections/:id", th.Connection.Delete)
			t.POST("/connections/:id/suspend", th.Connection.Suspend)
			t.POST("/connections/:id/resume", th.Connection.Resume)
			t.POST("/connections/:id/change-speed", th.Connection.ChangeSpeed)

			// Packages
			t.GET("/packages", th.Package.List)
			t.POST("/packages", th.Package.Create)
			t.GET("/packages/:id", th.Package.Get)
			t.PUT("/packages/:id", th.Package.Update)
			t.DELETE("/packages/:id", th.Package.Delete)

			// Invoices
			t.GET("/invoices", th.Invoice.List)
			t.POST("/invoices", th.Invoice.Create)
			t.GET("/invoices/:id", th.Invoice.Get)
			t.PUT("/invoices/:id", th.Invoice.Update)
			t.DELETE("/invoices/:id", th.Invoice.Delete)
			t.POST("/invoices/:id/send", th.Invoice.Send)
			t.GET("/invoices/:id/pdf", th.Invoice.PDF)
			t.POST("/invoices/:id/void", th.Invoice.Void)
			t.POST("/invoices/bulk-generate", th.Invoice.BulkGenerate)
			t.POST("/invoices/bulk-send", th.Invoice.BulkSend)

			// Payments
			t.GET("/payments", th.Payment.List)
			t.POST("/payments", th.Payment.Create)
			t.GET("/payments/:id", th.Payment.Get)
			t.GET("/payments/:id/receipt", th.Payment.Receipt)
			t.POST("/payments/:id/reverse", th.Payment.Reverse)

			// Routers
			t.GET("/routers", th.Router.List)
			t.POST("/routers", th.Router.Create)
			t.GET("/routers/:id", th.Router.Get)
			t.PUT("/routers/:id", th.Router.Update)
			t.DELETE("/routers/:id", th.Router.Delete)
			t.POST("/routers/:id/test", th.Router.Test)
			t.GET("/routers/:id/resources", th.Router.Resources)
			t.GET("/routers/:id/active-sessions", th.Router.ActiveSessions)
			t.POST("/routers/:id/sync", th.Router.Sync)

			// Hotspot
			t.GET("/hotspot/profiles", th.Hotspot.ListProfiles)
			t.POST("/hotspot/profiles", th.Hotspot.CreateProfile)
			t.PUT("/hotspot/profiles/:id", th.Hotspot.UpdateProfile)
			t.DELETE("/hotspot/profiles/:id", th.Hotspot.DeleteProfile)
			t.POST("/hotspot/vouchers/generate", th.Hotspot.GenerateVouchers)
			t.GET("/hotspot/vouchers", th.Hotspot.ListVouchers)
			t.GET("/hotspot/vouchers/print", th.Hotspot.PrintVouchers)
			t.GET("/hotspot/sessions", th.Hotspot.ListSessions)
			t.GET("/hotspot/users", th.Hotspot.ListUsers)
			t.POST("/hotspot/users", th.Hotspot.CreateUser)

			// Tickets
			t.GET("/tickets", th.Ticket.List)
			t.POST("/tickets", th.Ticket.Create)
			t.GET("/tickets/:id", th.Ticket.Get)
			t.PUT("/tickets/:id", th.Ticket.Update)
			t.POST("/tickets/:id/assign", th.Ticket.Assign)
			t.POST("/tickets/:id/comments", th.Ticket.AddComment)
			t.POST("/tickets/:id/close", th.Ticket.Close)
			t.POST("/tickets/:id/rate", th.Ticket.Rate)

			// Inventory
			t.GET("/inventory/items", th.Inventory.ListItems)
			t.POST("/inventory/items", th.Inventory.CreateItem)
			t.PUT("/inventory/items/:id", th.Inventory.UpdateItem)
			t.GET("/inventory/transactions", th.Inventory.ListTransactions)
			t.POST("/inventory/transactions", th.Inventory.CreateTransaction)
			t.GET("/inventory/assignments", th.Inventory.ListAssignments)
			t.POST("/inventory/assignments", th.Inventory.CreateAssignment)
			t.POST("/inventory/assignments/:id/return", th.Inventory.ReturnDevice)
			t.GET("/vendors", th.Inventory.ListVendors)
			t.POST("/vendors", th.Inventory.CreateVendor)

			// Staff
			t.GET("/staff", th.Staff.List)
			t.POST("/staff", th.Staff.Create)
			t.GET("/staff/:id", th.Staff.Get)
			t.PUT("/staff/:id", th.Staff.Update)
			t.DELETE("/staff/:id", th.Staff.Delete)
			t.POST("/staff/:id/attendance/checkin", th.Staff.CheckIn)
			t.POST("/staff/:id/attendance/checkout", th.Staff.CheckOut)
			t.GET("/staff/:id/attendance", th.Staff.AttendanceHistory)
			t.GET("/staff/:id/payroll", th.Staff.PayrollHistory)
			t.POST("/staff/:id/payroll", th.Staff.CreatePayroll)
			t.POST("/staff/:id/leaves", th.Staff.ApplyLeave)

			// Zones
			t.GET("/zones", th.Zone.List)
			t.POST("/zones", th.Zone.Create)
			t.GET("/zones/:id", th.Zone.Get)
			t.PUT("/zones/:id", th.Zone.Update)
			t.DELETE("/zones/:id", th.Zone.Delete)

			// Resellers
			t.GET("/resellers", th.Reseller.List)
			t.POST("/resellers", th.Reseller.Create)
			t.GET("/resellers/:id", th.Reseller.Get)
			t.PUT("/resellers/:id", th.Reseller.Update)
			t.GET("/resellers/:id/transactions", th.Reseller.Transactions)
			t.POST("/resellers/:id/wallet/topup", th.Reseller.WalletTopup)
			t.GET("/resellers/:id/customers", th.Reseller.Customers)

			// Accounting
			t.GET("/accounts", th.Accounting.ListAccounts)
			t.POST("/accounts", th.Accounting.CreateAccount)
			t.GET("/journal-entries", th.Accounting.ListJournalEntries)
			t.POST("/journal-entries", th.Accounting.CreateJournalEntry)
			t.GET("/bank-accounts", th.Accounting.ListBankAccounts)
			t.POST("/bank-accounts", th.Accounting.CreateBankAccount)
			t.GET("/expenses", th.Accounting.ListExpenses)
			t.POST("/expenses", th.Accounting.CreateExpense)
			t.PUT("/expenses/:id/approve", th.Accounting.ApproveExpense)

			// Reports
			t.GET("/reports/revenue", th.Report.Revenue)
			t.GET("/reports/collection", th.Report.Collection)
			t.GET("/reports/customers", th.Report.Customers)
			t.GET("/reports/network", th.Report.Network)
			t.GET("/reports/outstanding", th.Report.Outstanding)
			t.GET("/reports/pl", th.Report.ProfitLoss)
			t.GET("/reports/tax", th.Report.Tax)

			// Notifications
			t.GET("/notifications/templates", th.Notification.ListTemplates)
			t.PUT("/notifications/templates/:id", th.Notification.UpdateTemplate)
			t.POST("/notifications/send", th.Notification.Send)
			t.POST("/notifications/bulk-sms", th.Notification.BulkSMS)
			t.GET("/notifications/logs", th.Notification.Logs)

			// Settings
			t.GET("/settings", th.Settings.GetAll)
			t.PUT("/settings", th.Settings.UpdateBulk)
			t.PUT("/settings/:key", th.Settings.Update)
		}
	}

	return r
}
