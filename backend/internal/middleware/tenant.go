package middleware

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/database"
	"github.com/netaxis/backend/internal/models/public"
	"github.com/netaxis/backend/internal/utils"
	"gorm.io/gorm"
)

func TenantMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := GetTenantID(c)
		if tenantID == "" {
			if GetRole(c) == "superadmin" {
				// Superadmin gets public DB
				c.Set("db", db)
				c.Set("schema_name", "public")
				c.Next()
				return
			}
			utils.Error(c, http.StatusUnauthorized, "Tenant ID not found in token", nil)
			c.Abort()
			return
		}

		// Validate tenantID is a valid UUID
		if !utils.IsValidUUID(tenantID) {
			utils.Error(c, http.StatusBadRequest, "Invalid tenant ID format", nil)
			c.Abort()
			return
		}

		var tenant public.Tenant
		// Only select needed fields for performance
		if err := db.Select("id", "schema_name", "status").Where("id = ?", tenantID).Find(&tenant).Error; err != nil {
			// Log internal error, return generic message
			utils.Error(c, http.StatusNotFound, "Tenant not found", nil)
			c.Abort()
			return
		}

		// Defensive: check if tenant was found
		if tenant.ID == "" {
			utils.Error(c, http.StatusNotFound, "Tenant not found", nil)
			c.Abort()
			return
		}

		// Case-insensitive status check
		if status := tenant.Status; status != "" && status != "active" && status != "Active" {
			utils.Error(c, http.StatusForbidden, "Tenant is not active", nil)
			c.Abort()
			return
		}

		// Defensive: validate schema name before using
		if err := database.ValidateSchemaName(tenant.SchemaName); err != nil {
			utils.Error(c, http.StatusBadRequest, "Invalid schema name", nil)
			c.Abort()
			return
		}

		c.Set("schema_name", tenant.SchemaName)
		tenantDB := database.GetTenantDB(db, tenant.SchemaName)
		c.Set("db", tenantDB)
		c.Next()
	}
}
