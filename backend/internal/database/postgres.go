package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewPostgresDB(dbURL string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	return db
}

func RunMigrations(db *gorm.DB) error {
	migrationPath := "internal/database/migrations/000_public_schema.sql"
	content, err := os.ReadFile(migrationPath)
	if err != nil {
		return fmt.Errorf("failed to read public migration file: %v", err)
	}

	if err := db.Exec(string(content)).Error; err != nil {
		return fmt.Errorf("failed to execute public migration: %v", err)
	}

	log.Println("Public schema migrations completed successfully")
	return nil
}

func CreateTenantSchema(db *gorm.DB, schemaName string) error {
	// 1. Create schema
	if err := db.Exec(fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s", schemaName)).Error; err != nil {
		return fmt.Errorf("failed to create schema %s: %v", schemaName, err)
	}

	// 2. Load tenant migration file
	migrationPath := "internal/database/migrations/001_tenant_schema.sql"
	content, err := os.ReadFile(migrationPath)
	if err != nil {
		return fmt.Errorf("failed to read tenant migration file: %v", err)
	}

	// 3. Set search path and execute migration
	// Note: We use a session-local search path for execution
	tx := db.Begin()
	if err := tx.Exec(fmt.Sprintf("SET search_path TO %s, public", schemaName)).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to set search_path: %v", err)
	}

	if err := tx.Exec(string(content)).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute tenant migration for %s: %v", schemaName, err)
	}

	return tx.Commit().Error
}

func GetTenantDB(db *gorm.DB, schemaName string) *gorm.DB {
	// Returns a scoped DB with search_path set
	return db.Session(&gorm.Session{}).Exec(fmt.Sprintf("SET search_path TO %s, public", schemaName))
}
