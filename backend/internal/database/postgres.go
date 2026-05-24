package database

import (
	"fmt"
	"log"
	"os"
	"regexp"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// validateSchemaName ensures schema names are safe for interpolation
func validateSchemaName(name string) error {
	// Only allow alphanumeric and underscores, must start with a letter
	matched, err := regexp.MatchString(`^[a-zA-Z][a-zA-Z0-9_]*$`, name)
	if err != nil {
		return fmt.Errorf("failed to validate schema name: %v", err)
	}
	if !matched {
		return fmt.Errorf("invalid schema name: %s", name)
	}
	return nil
}

func NewPostgresDB(dbURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("Failed to connect to PostgreSQL: %v", err)
	}
	return db, nil
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
	// Validate schema name to prevent SQL injection
	if err := validateSchemaName(schemaName); err != nil {
		return err
	}

	// 1. Create schema safely
	if err := db.Exec(fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS \"%s\"", schemaName)).Error; err != nil {
		return fmt.Errorf("failed to create schema %s: %v", schemaName, err)
	}

	// 2. Load tenant migration file
	migrationPath := "internal/database/migrations/001_tenant_schema.sql"
	content, err := os.ReadFile(migrationPath)
	if err != nil {
		return fmt.Errorf("failed to read tenant migration file: %v", err)
	}

	// 3. Set search path and execute migration
	tx := db.Begin()
	if err := tx.Exec(fmt.Sprintf("SET search_path TO \"%s\", public", schemaName)).Error; err != nil {
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
	// Validate schema name to prevent SQL injection
	if err := validateSchemaName(schemaName); err != nil {
		log.Printf("invalid schema name: %v", err)
		return db // fallback to default
	}
	// Returns a new DB session with search_path set for this schema
	return db.Session(&gorm.Session{NewDB: true}).Exec(fmt.Sprintf("SET search_path TO \"%s\", public", schemaName))
}
