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

		var tenant public.Tenant
		if err := db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
			utils.Error(c, http.StatusNotFound, "Tenant not found", nil)
			c.Abort()
			return
		}

		if tenant.Status != "active" {
			utils.Error(c, http.StatusForbidden, "Tenant is not active", nil)
			c.Abort()
			return
		}

		c.Set("schema_name", tenant.SchemaName)
		tenantDB := database.GetTenantDB(db, tenant.SchemaName)
		c.Set("db", tenantDB)
		c.Next()
	}
}
