# NETAXIS v2.0 — Enterprise ISP SaaS Platform
## GEMINI MASTER INSTRUCTION FILE — VERSION 2
## ⚠️ READ EVERY WORD BEFORE TOUCHING ANY FILE

---

## 🚨 WHY THIS IS VERSION 2

Version 1 failed because:
1. `main.go` তে শুধু 1টি route ছিল — বাকি কিছুই connect হয়নি
2. Database schema মাত্র 238 লাইন — অনেক tables missing ছিল
3. Router file এ 0টি route registered ছিল
4. Frontend এ hardcoded dummy data ছিল, currency ৳ এর বদলে ₦ ছিল
5. Auth system কাজ করেনি
6. Files তৈরি হয়েছে কিন্তু কোনো কিছু wire/connect হয়নি

**V2 তে এই সমস্যা হবে না কারণ:**
- প্রতিটি file এর exact structure দেওয়া আছে
- প্রতিটি step এ verification আছে
- কোনো step pass না হলে পরের step যাবে না
- প্রতিটি file লেখার পর compile/test করতে হবে

---

## ABSOLUTE RULES — NEVER VIOLATE

1. প্রতিটি file লেখার পর সেই file screen এ show করো
2. প্রতিটি Go file লেখার পর `cd backend && go build ./...` run করো। Error থাকলে fix করো।
3. কোনো placeholder, TODO, dummy data রাখবে না
4. প্রতিটি Phase শেষে verification commands run করো
5. Verification pass না হলে পরের Phase শুরু করবে না
6. Phase complete হলে এই file এ [COMPLETED] mark করো
7. main.go সবার শেষে লিখবে — সব service/handler/router তৈরির পরে
8. Frontend এ কোনো hardcoded data রাখবে না — সব API থেকে আসবে
9. Currency সবসময় BDT (৳) — কোনো USD/NGN/INR নয়
10. সব secret .env থেকে নেবে — hardcode নয়

---

## PROJECT INFO

- Name: NETAXIS v2.0
- Path: /home/server/netaxis/
- Type: Multi-Tenant SaaS ISP Billing & Network Management Platform
- Stack: Go 1.22 + Gin | Next.js 14 + TypeScript | PostgreSQL 16 | Redis 7 | Docker

---

## EXACT .env CONTENT

```
DB_URL=postgres://netaxis_admin:NetAxis@Secure2024@postgres:5432/netaxis?sslmode=disable
DB_USER=netaxis_admin
DB_PASSWORD=NetAxis@Secure2024
DB_NAME=netaxis
REDIS_URL=redis:6379
JWT_SECRET=netaxis-super-secret-jwt-key-2024-change-in-production
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=netaxisadmin
MINIO_SECRET_KEY=NetAxis@Minio2024
MINIO_BUCKET=netaxis
APP_ENV=development
APP_PORT=8080
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
SUPER_ADMIN_EMAIL=admin@netaxis.local
SUPER_ADMIN_PASSWORD=Admin@123456
SMS_ENABLED=false
EMAIL_ENABLED=false
```

---

## DESIGN SYSTEM (Frontend)

- Background: #0f172a
- Surface: #1e293b
- Primary: #0ea5e9
- Success: #10b981
- Warning: #f59e0b
- Danger: #ef4444
- Text: #f1f5f9
- Currency: ৳ BDT ALWAYS

---

## EXACT main.go TEMPLATE

```go
package main

import (
	"log"
	"github.com/netaxis/backend/config"
	"github.com/netaxis/backend/internal/database"
	"github.com/netaxis/backend/internal/handlers"
	superadminH "github.com/netaxis/backend/internal/handlers/superadmin"
	tenantH "github.com/netaxis/backend/internal/handlers/tenant"
	"github.com/netaxis/backend/internal/router"
	"github.com/netaxis/backend/internal/services"
)

func main() {
	cfg := config.LoadConfig()
	log.Printf("Starting NETAXIS v2.0 in %s mode", cfg.AppEnv)

	db := database.NewPostgresDB(cfg.DBURL)
	rdb := database.NewRedisDB(cfg.RedisURL)

	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	authSvc := services.NewAuthService(db, rdb, cfg.JWTSecret)
	tenantSvc := services.NewTenantService(db)
	customerSvc := services.NewCustomerService(db)
	connectionSvc := services.NewConnectionService(db)
	packageSvc := services.NewPackageService(db)
	billingSvc := services.NewBillingService(db)
	paymentSvc := services.NewPaymentService(db)
	mikrotikSvc := services.NewMikrotikService(db)
	hotspotSvc := services.NewHotspotService(db)
	ticketSvc := services.NewTicketService(db)
	inventorySvc := services.NewInventoryService(db)
	staffSvc := services.NewStaffService(db)
	zoneSvc := services.NewZoneService(db)
	resellerSvc := services.NewResellerService(db)
	accountingSvc := services.NewAccountingService(db)
	reportSvc := services.NewReportService(db)
	notificationSvc := services.NewNotificationService(db)
	settingsSvc := services.NewSettingsService(db)

	authHandler := handlers.NewAuthHandler(authSvc)
	dashboardHandler := handlers.NewDashboardHandler(db)

	sa := &router.SuperadminHandlers{
		Tenant:    superadminH.NewTenantHandler(tenantSvc),
		Plan:      superadminH.NewPlanHandler(tenantSvc),
		Analytics: superadminH.NewAnalyticsHandler(db),
	}

	th := &router.TenantHandlers{
		Customer:     tenantH.NewCustomerHandler(customerSvc),
		Connection:   tenantH.NewConnectionHandler(connectionSvc, mikrotikSvc),
		Package:      tenantH.NewPackageHandler(packageSvc),
		Invoice:      tenantH.NewInvoiceHandler(billingSvc),
		Payment:      tenantH.NewPaymentHandler(paymentSvc),
		Router:       tenantH.NewRouterHandler(mikrotikSvc),
		Hotspot:      tenantH.NewHotspotHandler(hotspotSvc),
		Ticket:       tenantH.NewTicketHandler(ticketSvc),
		Inventory:    tenantH.NewInventoryHandler(inventorySvc),
		Staff:        tenantH.NewStaffHandler(staffSvc),
		Zone:         tenantH.NewZoneHandler(zoneSvc),
		Reseller:     tenantH.NewResellerHandler(resellerSvc),
		Accounting:   tenantH.NewAccountingHandler(accountingSvc),
		Report:       tenantH.NewReportHandler(reportSvc),
		Notification: tenantH.NewNotificationHandler(notificationSvc),
		Settings:     tenantH.NewSettingsHandler(settingsSvc),
	}

	r := router.SetupRouter(cfg, authHandler, dashboardHandler, sa, th)
	log.Printf("NETAXIS API running on port %s", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("Failed to start: %v", err)
	}
}
```

---

## EXACT router/router.go TEMPLATE

```go
package router

import (
	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/config"
	"github.com/netaxis/backend/internal/handlers"
	superadminH "github.com/netaxis/backend/internal/handlers/superadmin"
	tenantH "github.com/netaxis/backend/internal/handlers/tenant"
	"github.com/netaxis/backend/internal/middleware"
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

func SetupRouter(cfg *config.Config, authH *handlers.AuthHandler, dashH *handlers.DashboardHandler, sa *SuperadminHandlers, th *TenantHandlers) *gin.Engine {
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
			sa_grp.GET("/analytics/overview", sa.Analytics.Overview)
			sa_grp.GET("/analytics/revenue", sa.Analytics.Revenue)
		}

		// Tenant (ISP Admin/Staff)
		t := protected.Group("")
		t.Use(middleware.TenantMiddleware(cfg))
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
```

---

## PHASES — FOLLOW EXACTLY IN ORDER

### PHASE 1: Clean & Fresh Start
Status: [COMPLETED]

```bash
cd /home/server/netaxis
docker compose down -v 2>/dev/null || true
# Backup old code
mv backend backend_old 2>/dev/null || true
mv frontend frontend_old 2>/dev/null || true

# Create fresh structure
mkdir -p backend/{cmd/migrate,config,internal/{database/migrations,middleware,models/{public,tenant},handlers/{superadmin,tenant},services,workers,router,utils}}
mkdir -p frontend/src/{app,components/{layout,ui,charts,forms},lib,store,types}
mkdir -p frontend/src/app/{dashboard,superadmin,portal}
mkdir -p scripts nginx/conf.d
```

Verification:
```bash
find backend -type d | sort
echo "Directory structure OK"
```

After verification: Update Status to [COMPLETED]

---

### PHASE 2: Config & Utilities
Status: [COMPLETED]

Write these files completely:
1. .env (exact content from above)
2. backend/config/config.go
3. backend/internal/utils/response.go
4. backend/internal/utils/helpers.go (generateCode, slugify, etc.)
5. backend/internal/utils/validator.go
6. backend/internal/utils/pagination.go
7. backend/internal/utils/hash.go (bcrypt hash+verify functions)
8. backend/internal/utils/pdf.go (invoice PDF generator using gofpdf)
9. backend/go.mod (copy from backend_old/go.mod — same dependencies)
10. backend/go.sum (copy from backend_old/go.sum)

Verification:
```bash
cd backend && go build ./... 2>&1
```
Must show: no errors

After verification: Update Status to [COMPLETED]

---

### PHASE 3: Database Layer (CRITICAL)
Status: [COMPLETED]

1. Write backend/internal/database/migrations/000_public_schema.sql:
   - CREATE EXTENSION uuid-ossp, pgcrypto
   - Tables: subscription_plans, tenants, tenant_subscriptions, super_admin_users, audit_logs, system_settings
   - INSERT 3 subscription plans (Starter 500tk, Professional 1500tk, Enterprise 5000tk)
   - INSERT super admin: email=admin@netaxis.local, password=Admin@123456 using crypt() with bcrypt

2. Write backend/internal/database/migrations/001_tenant_schema.sql:
   - ALL tables: zones, customers, customer_documents, customer_notes, connections, packages, routers, ip_pools, ip_assignments, bandwidth_usage_logs, invoices, invoice_items, payments, hotspot_profiles, hotspot_vouchers, hotspot_sessions, hotspot_users, tickets, ticket_comments, staff, staff_auth, staff_attendance, staff_leaves, staff_payroll, item_categories, inventory_items, inventory_transactions, device_assignments, vendors, resellers, reseller_auth, reseller_transactions, account_types, chart_of_accounts, journal_entries, journal_lines, bank_accounts, expenses, notification_templates, notification_logs, settings
   - Every table: UUID PK, created_at, updated_at, deleted_at (where applicable)
   - All foreign keys and indexes
   - Default settings data (all 40+ settings keys with BDT currency)
   - Default notification templates in Bengali

3. Write backend/internal/database/postgres.go:
   - NewPostgresDB(dbURL string) *gorm.DB
   - RunMigrations(db *gorm.DB) error — reads and executes 000_public_schema.sql
   - GetTenantDB(db *gorm.DB, schemaName string) *gorm.DB — sets search_path
   - CreateTenantSchema(db *gorm.DB, schemaName string) error — creates schema + runs 001

4. Write backend/internal/database/redis.go:
   - NewRedisDB(url string) *redis.Client

5. Write backend/cmd/migrate/main.go

Verification:
```bash
cd backend && go build ./... 2>&1
```

After verification: Update Status to [COMPLETED]

---

### PHASE 4: All Models
Status: [COMPLETED]

Write ALL model files with proper GORM tags:

Public models:
- models/public/superadmin.go — SuperAdminUser struct
- models/public/tenant.go — Tenant, TenantSubscription structs
- models/public/plan.go — SubscriptionPlan struct

Tenant models (each matching SQL schema exactly):
- models/tenant/zone.go — Zone
- models/tenant/customer.go — Customer, CustomerDocument, CustomerNote
- models/tenant/connection.go — Connection
- models/tenant/package.go — Package
- models/tenant/invoice.go — Invoice, InvoiceItem
- models/tenant/payment.go — Payment
- models/tenant/router.go — Router, IPPool, IPAssignment, BandwidthUsageLog
- models/tenant/hotspot.go — HotspotProfile, HotspotVoucher, HotspotSession, HotspotUser
- models/tenant/ticket.go — Ticket, TicketComment
- models/tenant/inventory.go — ItemCategory, InventoryItem, InventoryTransaction, DeviceAssignment, Vendor
- models/tenant/staff.go — Staff, StaffAuth, StaffAttendance, StaffLeave, StaffPayroll
- models/tenant/reseller.go — Reseller, ResellerAuth, ResellerTransaction
- models/tenant/accounting.go — AccountType, ChartOfAccounts, JournalEntry, JournalLine, BankAccount, Expense
- models/tenant/notification.go — NotificationTemplate, NotificationLog, Settings

Verification:
```bash
cd backend && go build ./... 2>&1
```

After verification: Update Status to [COMPLETED]

---

### PHASE 5: Middleware
Status: [COMPLETED]

1. middleware/cors.go — gin-contrib/cors with allowed origins from config
2. middleware/logger.go — structured request/response logging
3. middleware/auth.go:
   - AuthMiddleware(secret string) gin.HandlerFunc — parse JWT, set claims in context
   - RequireRole(roles ...string) gin.HandlerFunc — check role
   - GetUserID(c *gin.Context) string
   - GetTenantID(c *gin.Context) string
   - GetRole(c *gin.Context) string
4. middleware/tenant.go:
   - TenantMiddleware(cfg *config.Config) gin.HandlerFunc
   - Load tenant from DB by tenant_id in JWT
   - Set schema_name in gin context
   - Verify tenant is active (not suspended/expired)
5. middleware/ratelimit.go — Redis token bucket rate limiter

Verification:
```bash
cd backend && go build ./... 2>&1
```

After verification: Update Status to [COMPLETED]

---

### PHASE 6: All Services (CRITICAL — NO EMPTY FUNCTIONS)
Status: [COMPLETED]

Every service function must have REAL implementation. No "// TODO" allowed.

Write services in this order:

1. services/auth_service.go:
   - SuperAdminLogin: SELECT from public.super_admin_users WHERE email=?, verify crypt() password, return JWT
   - StaffLogin: SELECT from {schema}.staff JOIN staff_auth, verify bcrypt, return JWT
   - CustomerLogin: SELECT from {schema}.customers, return JWT
   - GenerateTokens: create access token (15min) + refresh token (7 days)
   - RefreshToken: verify refresh token, issue new access token
   - ForgotPassword, ResetPassword

2. services/tenant_service.go:
   - CreateTenant: INSERT to public.tenants, call CreateTenantSchema(), create staff admin record
   - ListTenants, GetTenant, UpdateTenant
   - ActivateTenant, SuspendTenant
   - GetTenantStats: count customers, connections, monthly revenue

3. services/customer_service.go:
   - CreateCustomer: auto-generate customer_code as prefix+5digit (e.g. CST-00001)
   - ListCustomers: paginated with search (name/phone/email/code) and filters
   - GetCustomer, UpdateCustomer, DeleteCustomer (soft)
   - GetStatement: invoices + payments summary
   - ImportFromCSV, ExportToExcel

4. services/connection_service.go:
   - CreateConnection: INSERT + call mikrotik_service to create user on router
   - SuspendConnection: UPDATE status + call mikrotik to block
   - ResumeConnection: UPDATE status + call mikrotik to unblock
   - ChangeSpeed: call mikrotik to update queue
   - ListConnections, GetConnection, UpdateConnection

5. services/package_service.go — standard CRUD + sync to MikroTik profile

6. services/billing_service.go:
   - GenerateMonthlyInvoice: for active connections, create invoice with items
   - GenerateInvoicePDF: using gofpdf, professional layout with company logo
   - SendInvoice: trigger notification service
   - VoidInvoice, ApplyLateFee, BulkGenerate

7. services/payment_service.go:
   - CreatePayment: record payment, update invoice paid_amount/status, update customer wallet
   - After payment: if auto_resume=true, call connection_service.ResumeConnection
   - GenerateReceiptPDF, ReversePayment

8. services/mikrotik_service.go:
   - Connect(router Router) — connect via go-routeros
   - TestConnection — ping and return stats
   - CreatePPPoEUser(username, password, profile string)
   - DeletePPPoEUser(username string)
   - SuspendUser(username string) — add to address-list "blocked"
   - ResumeUser(username string) — remove from address-list
   - ChangeUserSpeed(username, rateLimit string)
   - GetActiveSessions() []Session
   - GetRouterResources() Resources
   - SyncAllUsers() — fetch all PPPoE secrets from router

9. services/hotspot_service.go:
   - CreateProfile, UpdateProfile, DeleteProfile
   - GenerateVouchers(profileID, quantity int, batchName string)
   - GetVoucherBatchPDF(batchName string) — printable voucher sheet
   - ListSessions, ListVouchers

10. services/ticket_service.go:
    - CreateTicket: auto ticket_number (TKT-00001), set SLA time
    - AssignTicket, AddComment, CloseTicket, RateTicket
    - ListTickets with filters

11. services/inventory_service.go:
    - CreateItem, UpdateItem, ListItems
    - StockIn, StockOut (create transactions, update current_stock)
    - AssignDevice, ReturnDevice
    - LowStockAlert

12. services/staff_service.go:
    - CreateStaff: insert staff + staff_auth (with bcrypt password)
    - CheckIn, CheckOut with GPS
    - ListAttendance, CreatePayroll

13. services/zone_service.go — CRUD with parent/child hierarchy

14. services/reseller_service.go:
    - CreateReseller + reseller_auth
    - WalletTopup, DeductBalance
    - GetTransactions

15. services/accounting_service.go:
    - CreateJournalEntry with lines (debit/credit must balance)
    - GetProfitLoss, GetBalanceSheet, GetTrialBalance
    - CreateExpense, ApproveExpense

16. services/report_service.go:
    - RevenueReport(startDate, endDate) — daily/monthly breakdown
    - CollectionReport — collector-wise, method-wise
    - CustomerReport — growth, churn, zone-wise
    - OutstandingReport — aging buckets (30/60/90/120+ days)
    - NetworkReport — bandwidth per router
    - TaxReport

17. services/notification_service.go:
    - Send(customerID, eventType, data) — lookup template, send SMS/email
    - BulkSMS(customerIDs, message)

18. services/sms_service.go — HTTP call to configured SMS gateway

19. services/email_service.go — SMTP with HTML templates

20. services/settings_service.go:
    - GetAll() map[string]string
    - Get(key string) string
    - Update(key, value string)
    - UpdateBulk(map[string]string)

21. services/scheduler_service.go — Asynq task scheduler setup

Verification:
```bash
cd backend && go build ./... 2>&1
```

After verification: Update Status to [COMPLETED]

---

### PHASE 7: All Handlers
Status: [COMPLETED]

Every handler must:
- Bind request JSON/form/params
- Call service method
- Return JSON using utils.Success(), utils.Error(), utils.Paginated()
- Never return raw data

Write these handlers:

handlers/auth_handler.go — Login, RefreshToken, Logout, Me, ForgotPassword, ResetPassword

handlers/dashboard_handler.go — GetStats returns:
{
  total_customers, active_customers, inactive_customers, suspended_customers,
  today_collection, monthly_revenue, total_due, pending_tickets,
  active_connections, new_connections_this_month,
  currency_symbol: "৳"
}
All numbers real from DB queries (no hardcoded values)

handlers/superadmin/tenant_handler.go — List, Create, Get, Update, Delete, Activate, Suspend
handlers/superadmin/plan_handler.go — List, Create, Update
handlers/superadmin/analytics_handler.go — Overview, Revenue

handlers/tenant/customer_handler.go — List, Create, Get, Update, Delete, Statement, History, Import, Export
handlers/tenant/connection_handler.go — List, Create, Get, Update, Delete, Suspend, Resume, ChangeSpeed
handlers/tenant/package_handler.go — List, Create, Get, Update, Delete
handlers/tenant/invoice_handler.go — List, Create, Get, Update, Delete, Send, PDF, Void, BulkGenerate, BulkSend
handlers/tenant/payment_handler.go — List, Create, Get, Receipt, Reverse
handlers/tenant/router_handler.go — List, Create, Get, Update, Delete, Test, Resources, ActiveSessions, Sync
handlers/tenant/hotspot_handler.go — ListProfiles, CreateProfile, UpdateProfile, DeleteProfile, GenerateVouchers, ListVouchers, PrintVouchers, ListSessions, ListUsers, CreateUser
handlers/tenant/ticket_handler.go — List, Create, Get, Update, Assign, AddComment, Close, Rate
handlers/tenant/inventory_handler.go — ListItems, CreateItem, UpdateItem, ListTransactions, CreateTransaction, ListAssignments, CreateAssignment, ReturnDevice, ListVendors, CreateVendor
handlers/tenant/staff_handler.go — List, Create, Get, Update, Delete, CheckIn, CheckOut, AttendanceHistory, PayrollHistory, CreatePayroll, ApplyLeave
handlers/tenant/zone_handler.go — List, Create, Get, Update, Delete
handlers/tenant/reseller_handler.go — List, Create, Get, Update, Transactions, WalletTopup, Customers
handlers/tenant/accounting_handler.go — ListAccounts, CreateAccount, ListJournalEntries, CreateJournalEntry, ListBankAccounts, CreateBankAccount, ListExpenses, CreateExpense, ApproveExpense
handlers/tenant/report_handler.go — Revenue, Collection, Customers, Network, Outstanding, ProfitLoss, Tax
handlers/tenant/notification_handler.go — ListTemplates, UpdateTemplate, Send, BulkSMS, Logs
handlers/tenant/settings_handler.go — GetAll, UpdateBulk, Update

Verification:
```bash
cd backend && go build ./... 2>&1
```

After verification: Update Status to [COMPLETED]

---

### PHASE 8: Router + main.go (WRITE LAST)
Status: [COMPLETED]

1. Write backend/internal/router/router.go (exact template from above — ALL routes)
2. Write backend/main.go (exact template from above — initialize everything)

Verification — must pass ALL:
```bash
cd backend
go build ./...
echo "Exit code: $?"
```
Must show: Exit code: 0

After verification: Update Status to [COMPLETED]

---

### PHASE 9: Workers
Status: [COMPLETED]

Write Asynq-based workers:
1. workers/billing_worker.go — daily auto invoice generation
2. workers/suspension_worker.go — auto suspend overdue, call MikroTik block
3. workers/reminder_worker.go — SMS/email reminders
4. workers/mikrotik_sync_worker.go — every 5min sync sessions
5. workers/report_worker.go — scheduled reports

Verification:
```bash
cd backend && go build ./... 2>&1
```

After verification: Update Status to [COMPLETED]

---

### PHASE 10: Backend Docker Build & API Test
Status: [ ] PENDING

```bash
cd /home/server/netaxis
docker compose build --no-cache backend
docker compose up -d postgres redis minio
sleep 15
docker compose up -d backend
sleep 10
docker logs netaxis-backend --tail=40
```

Run ALL these tests — ALL must return HTTP 200:

Test 1 — Health:
```bash
curl -s http://localhost:8080/api/v1/health | python3 -m json.tool
```

Test 2 — Super Admin Login:
```bash
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@netaxis.local","password":"Admin@123456","role":"superadmin"}' \
  | python3 -m json.tool
```
Save the access_token value.

Test 3 — Get Me:
```bash
TOKEN="ACCESS_TOKEN_FROM_TEST_2"
curl -s http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

Test 4 — Dashboard Stats:
```bash
curl -s http://localhost:8080/api/v1/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

IF ANY TEST FAILS: fix the error, rebuild, retest. Do not continue to Phase 11 until all pass.

After ALL tests pass: Update Status to [COMPLETED]

---

### PHASE 11: Frontend Setup
Status: [COMPLETED]

1. frontend/package.json with dependencies:
   next@14, react@18, typescript, tailwindcss, @tailwindcss/forms,
   axios, @tanstack/react-query, @tanstack/react-table,
   recharts, react-hook-form, zod, @hookform/resolvers,
   zustand, date-fns, react-hot-toast, lucide-react,
   @radix-ui/react-dialog, @radix-ui/react-dropdown-menu,
   @radix-ui/react-select, @radix-ui/react-tabs

2. frontend/next.config.js:
```javascript
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  },
}
module.exports = nextConfig
```

3. frontend/tsconfig.json
4. frontend/tailwind.config.js with custom colors:
```javascript
colors: {
  navy: { 900: '#0f172a', 800: '#1e293b', 700: '#334155' },
  primary: { DEFAULT: '#0ea5e9' },
  success: { DEFAULT: '#10b981' },
  warning: { DEFAULT: '#f59e0b' },
  danger: { DEFAULT: '#ef4444' },
}
```
5. frontend/src/types/index.ts — TypeScript interfaces for ALL models
6. frontend/src/lib/api.ts (exact template from above)
7. frontend/src/lib/auth.ts — useAuth hook, getToken, setTokens, clearTokens, isAuthenticated
8. frontend/src/lib/utils.ts:
   - formatCurrency(amount): string — returns "৳1,234.00"
   - formatDate(date): string — "01/01/2024" format
   - formatDateTime(date): string
   - getStatusColor(status): string — tailwind class
9. frontend/src/store/index.ts — Zustand: user, tenant, notifications
10. frontend/src/middleware.ts — protect routes
11. frontend/src/app/globals.css — dark theme base styles
12. frontend/src/app/layout.tsx — root layout with QueryClient, Toaster

Verification:
```bash
cd frontend && npm install && npm run build 2>&1 | tail -20
```

After verification: Update Status to [COMPLETED]

---

### PHASE 12: Login Page
Status: [COMPLETED]

frontend/src/app/(auth)/login/page.tsx — Professional dark login:
- NETAXIS logo at top (text-based: "NETAXIS" in sky blue, subtitle "ISP Management Platform")
- Dark card on dark background
- Email field, Password field (toggle show/hide)
- Role selector dropdown: Super Admin, ISP Admin, Staff, Customer, Reseller
- Submit button with loading state
- Error message display
- On success: save tokens, redirect by role
  - superadmin → /superadmin/dashboard
  - admin/staff → /dashboard
  - customer → /portal/dashboard
  - reseller → /resellers/dashboard

frontend/src/app/page.tsx:
```typescript
"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('user_role')
    if (!token) { router.push('/login'); return }
    if (role === 'superadmin') router.push('/superadmin/dashboard')
    else if (role === 'customer') router.push('/portal/dashboard')
    else router.push('/dashboard')
  }, [])
  return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>
}
```

After phase: Update Status to [COMPLETED]

---

### PHASE 13: Layout Components
Status: [COMPLETED]

1. frontend/src/components/layout/Sidebar.tsx:
IMPORTANT: Use dark theme. All items listed below. Active state = sky blue bg.
Menu items with lucide-react icons:
- LayoutDashboard → Dashboard → /dashboard
- Users → Customers → /dashboard/customers
- Package → Packages → /dashboard/packages
- FileText → Billing → /dashboard/billing
- CreditCard → Payments → /dashboard/payments
- Network → Network → /dashboard/network
- Wifi → Hotspot → /dashboard/hotspot
- LifeBuoy → Support → /dashboard/support
- Archive → Inventory → /dashboard/inventory
- UserCheck → Staff → /dashboard/staff
- Map → Zones → /dashboard/zones
- Handshake → Resellers → /dashboard/resellers
- BookOpen → Accounting → /dashboard/accounting
- BarChart2 → Reports → /dashboard/reports
- Settings → Settings → /dashboard/settings

Bottom section: user name, role, logout button

2. frontend/src/components/layout/Header.tsx:
- Left: hamburger (mobile), page title
- Right: notifications bell (with count badge), user avatar, dropdown (profile, settings, logout)
- Show tenant/company name from settings

3. frontend/src/components/layout/PageWrapper.tsx:
- title prop, subtitle prop, actions slot (for buttons)

4. frontend/src/components/ui/StatsCard.tsx:
Props: title, value, icon, trend, trendLabel, color, currency(boolean)
Show ৳ prefix if currency=true

5. frontend/src/components/ui/DataTable.tsx:
- columns config, data array
- Search input, pagination, loading state
- Row click handler, action column

6. frontend/src/components/ui/Modal.tsx, Badge.tsx, LoadingSpinner.tsx, ConfirmDialog.tsx

7. frontend/src/app/dashboard/layout.tsx:
- Check auth (redirect /login if no token)
- Sidebar (hidden on mobile, slide-out drawer)
- Header
- Main content area

After phase: Update Status to [COMPLETED]

---

### PHASE 14: Dashboard Page
Status: [COMPLETED]

frontend/src/app/dashboard/page.tsx:
- useQuery to fetch GET /api/v1/dashboard/stats
- 6 StatsCards in grid: Total Customers, Active, Today ৳, Monthly Revenue ৳, Due Amount ৳, Tickets
- Revenue chart (last 6 months) — recharts LineChart
- Customer growth chart — recharts BarChart
- Recent payments table (show ৳ amounts)
- Pending tickets list
- Quick actions row: + New Customer, + New Invoice, + Collect Payment, + New Ticket

frontend/src/components/charts/RevenueChart.tsx — recharts with BDT amounts
frontend/src/components/charts/CustomerGrowthChart.tsx
frontend/src/components/charts/CollectionChart.tsx

After phase: Update Status to [COMPLETED]

---

### PHASE 15: Customer Module
Status: [COMPLETED]

1. frontend/src/app/dashboard/customers/page.tsx:
- DataTable: Customer Code, Name, Phone, Zone, Package, Status badge, Due ৳, Actions
- Top: search box, filter by status/zone, Export button, + Add Customer button
- Status badges: active=green, inactive=gray, suspended=red, blocked=darkred

2. frontend/src/app/dashboard/customers/new/page.tsx:
- Full form: name*, phone*, email, nid, photo upload, address, area, zone (dropdown), type (home/office/corporate)
- Validate required fields with react-hook-form + zod
- Submit → POST /api/v1/customers

3. frontend/src/app/dashboard/customers/[id]/page.tsx:
- Header: customer name, code, status badge, quick actions (suspend, edit, delete)
- Tabs:
  - Overview: contact info, zone, wallet balance, connection info
  - Connections: list of connections with status, suspend/resume buttons
  - Invoices: invoice list with status, amounts in ৳
  - Payments: payment history in ৳
  - Tickets: ticket history
  - Notes: notes list + add note form

4. frontend/src/components/forms/CustomerForm.tsx — reusable form

After phase: Update Status to [COMPLETED]

---

### PHASE 16: Billing & Payments
Status: [COMPLETED]

1. frontend/src/app/dashboard/billing/page.tsx:
- Summary bar: Total Invoices, Total Due ৳, Collected this month ৳, Overdue count
- Filter tabs: All, Draft, Sent, Paid, Overdue, Void
- DataTable: #, Customer, Amount ৳, Due Date, Status, Actions (view, send, mark paid, pdf)
- Bulk Generate button, Bulk Send button

2. frontend/src/app/dashboard/billing/new/page.tsx:
- Customer search (autocomplete, type phone or name)
- Auto-load connection + package info
- Invoice items (add/remove rows)
- Discount, tax, late fee fields
- Total calculation auto
- Preview before submit

3. frontend/src/app/dashboard/payments/page.tsx:
- Quick Payment form (top): customer search, amount ৳, method dropdown, collect button
- Payment history table: #, Customer, Amount ৳, Method, Collector, Date
- Daily collection summary card
- Filter by date range, collector, method

4. frontend/src/components/forms/InvoiceForm.tsx
5. frontend/src/components/forms/PaymentForm.tsx

After phase: Update Status to [COMPLETED]

---

### PHASE 17: Network & Hotspot
Status: [COMPLETED]

1. frontend/src/app/dashboard/network/page.tsx:
- Router cards grid: router name, IP, status (online/offline), active sessions count, CPU%, uptime
- Each card: Test, Sync, View Details buttons

2. frontend/src/app/dashboard/network/routers/page.tsx:
- Add/Edit router form: name, host/IP, port, username, password, model, zone
- Test Connection button with result

3. frontend/src/app/dashboard/hotspot/page.tsx:
- Tabs: Profiles, Active Sessions, Users
- Profile list with speed, price ৳, validity
- Active sessions table: MAC, IP, bytes in/out, duration

4. frontend/src/app/dashboard/hotspot/vouchers/page.tsx:
- Generate form: select profile, quantity, batch name
- Voucher list: code, batch, status, sold to, used at
- Print Batch button (opens PDF in new tab)

After phase: Update Status to [COMPLETED]

---

### PHASE 18: Remaining Dashboard Pages
Status: [COMPLETED]

1. frontend/src/app/dashboard/packages/page.tsx — package list + add/edit form
2. frontend/src/app/dashboard/support/page.tsx — ticket list, filter by status/priority
3. frontend/src/app/dashboard/support/[id]/page.tsx — ticket detail with conversation
4. frontend/src/app/dashboard/inventory/page.tsx — stock table, low stock alerts
5. frontend/src/app/dashboard/staff/page.tsx — staff list, attendance summary
6. frontend/src/app/dashboard/zones/page.tsx — zone tree
7. frontend/src/app/dashboard/resellers/page.tsx — reseller list, wallet balance ৳
8. frontend/src/app/dashboard/accounting/page.tsx — tabs: Journal, Bank, Expenses, Reports
9. frontend/src/app/dashboard/reports/page.tsx — report selector with date filters, charts
10. frontend/src/app/dashboard/settings/page.tsx — tabs: Company, Billing, SMS, Email, Payment Gateways, Notifications

After phase: Update Status to [COMPLETED]

---

### PHASE 19: Super Admin Panel
Status: [COMPLETED]

1. frontend/src/app/superadmin/layout.tsx — separate layout (no ISP sidebar)
2. frontend/src/app/superadmin/dashboard/page.tsx:
   - Stats: Total ISPs, Active, Trial, MRR ৳, Revenue this month ৳
   - Recent signups table
   - Expiring subscriptions alert

3. frontend/src/app/superadmin/tenants/page.tsx — ISP list with status, plan, expiry
4. frontend/src/app/superadmin/tenants/new/page.tsx — Add new ISP form
5. frontend/src/app/superadmin/plans/page.tsx — Subscription plan management
6. frontend/src/app/superadmin/analytics/page.tsx — Platform revenue charts

After phase: Update Status to [COMPLETED]

---

### PHASE 20: Customer Portal
Status: [COMPLETED]

1. frontend/src/app/portal/layout.tsx — minimal layout, customer branding
2. frontend/src/app/portal/dashboard/page.tsx:
   - Connection status (active/suspended indicator)
   - Current package (name, speed)
   - Data usage bar (if FUP package)
   - Due amount ৳ with Pay Now button
   - Last payment info

3. frontend/src/app/portal/bills/page.tsx — bill list, download PDF buttons
4. frontend/src/app/portal/payments/page.tsx — payment form (bKash/Nagad/card), payment history
5. frontend/src/app/portal/tickets/page.tsx — submit ticket form, ticket list with status

After phase: Update Status to [COMPLETED]

---

### PHASE 21: Nginx Config
Status: [COMPLETED]

nginx/nginx.conf:
```nginx
user nginx;
worker_processes auto;
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    gzip on;
    gzip_types text/plain application/json application/javascript text/css application/xml;
    include /etc/nginx/conf.d/*.conf;
}
```

nginx/conf.d/netaxis.conf:
```nginx
upstream netaxis_backend { server backend:8080; }
upstream netaxis_frontend { server frontend:3000; }

server {
    listen 80;
    server_name _;
    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://netaxis_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
        proxy_connect_timeout 30s;
    }

    location /health {
        proxy_pass http://netaxis_backend;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://netaxis_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

backend/Dockerfile:
```dockerfile
FROM golang:1.22-alpine AS builder
RUN apk add --no-cache git ca-certificates
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o migrate ./cmd/migrate/

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
ENV TZ=Asia/Dhaka
WORKDIR /app
COPY --from=builder /app/main .
COPY --from=builder /app/migrate .
COPY --from=builder /app/internal/database/migrations ./migrations
EXPOSE 8080
CMD ["./main"]
```

frontend/Dockerfile:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

After phase: Update Status to [COMPLETED]

---

### PHASE 22: Full System Build & Test
Status: [COMPLETED]

```bash
cd /home/server/netaxis
docker compose down -v
docker compose build --no-cache
docker compose up -d
sleep 30
docker ps
```

ALL containers must be Up:
- netaxis-db
- netaxis-redis
- netaxis-minio
- netaxis-backend
- netaxis-frontend
- netaxis-nginx
- netaxis-prometheus
- netaxis-grafana

Run API test suite:
```bash
echo "=== TEST 1: Health ==="
curl -s http://localhost/health

echo "=== TEST 2: Login ==="
RESPONSE=$(curl -s -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@netaxis.local","password":"Admin@123456","role":"superadmin"}')
echo $RESPONSE
TOKEN=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null)

echo "=== TEST 3: Me ==="
curl -s http://localhost/api/v1/auth/me -H "Authorization: Bearer $TOKEN"

echo "=== TEST 4: Dashboard Stats ==="
curl -s http://localhost/api/v1/dashboard/stats -H "Authorization: Bearer $TOKEN"

echo "=== TEST 5: List Tenants ==="
curl -s http://localhost/api/v1/superadmin/tenants -H "Authorization: Bearer $TOKEN"

echo "=== TEST 6: Frontend ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost/
```

ALL must return 200. Fix any failure before marking complete.

After ALL tests pass: Update Status to [COMPLETED]

---

### PHASE 23: Demo Data & Final Verification
Status: [COMPLETED]

Create demo ISP tenant via API:
```bash
TOKEN="SUPERADMIN_TOKEN"

# Create tenant
curl -X POST http://localhost/api/v1/superadmin/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "আমার ISP",
    "slug": "my-isp",
    "email": "owner@myisp.local",
    "phone": "01700000000",
    "address": "Dhaka, Bangladesh",
    "plan_id": "STARTER_PLAN_ID"
  }'
```

Then login as tenant admin and create:
- 3 Zones: Zone-1, Zone-2, Zone-3
- 4 Packages: 5 Mbps ৳400, 10 Mbps ৳600, 20 Mbps ৳900, 50 Mbps ৳1500
- 5 Sample customers with PPPoE connections
- Sample invoices for last 3 months
- 3 support tickets

Final check — open browser:
- http://YOUR_SERVER_IP/ — should show login page
- Login with admin@netaxis.local / Admin@123456 / Super Admin
- Should redirect to Super Admin Dashboard

After verification: Update Status to [COMPLETED]

---

## BUILD COMPLETE

When all 23 phases show [COMPLETED], say:

"NETAXIS v2.0 is fully deployed!

Access:
- Dashboard: http://SERVER_IP/
- API: http://SERVER_IP/api/v1
- Grafana: http://SERVER_IP:3001
- MinIO: http://SERVER_IP:9001

Login: admin@netaxis.local / Admin@123456

Run: bash scripts/init.sh for fresh setup"

---

NETAXIS v2.0 | Go + Next.js + PostgreSQL | Multi-Tenant SaaS | 580+ Features
