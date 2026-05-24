package main

import (
	"log"

	"github.com/netaxis/backend/config"
	"github.com/netaxis/backend/internal/database"
)

func main() {
	cfg := config.LoadConfig()
	db := database.NewPostgresDB(cfg.DBURL)

	log.Println("Starting public schema migration...")
	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	log.Println("Migration finished successfully.")
}
