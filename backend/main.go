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

	r := router.SetupRouter(cfg, db, authHandler, dashboardHandler, sa, th)
	log.Printf("NETAXIS API running on port %s", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("Failed to start: %v", err)
	}
}
