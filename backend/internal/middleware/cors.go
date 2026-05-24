package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware(frontendURL string) gin.HandlerFunc {
	config := cors.DefaultConfig()
	if frontendURL == "*" || frontendURL == "" {
		config.AllowAllOrigins = true
	} else {
		config.AllowOrigins = []string{frontendURL}
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Authorization", "Content-Type", "X-Tenant-ID", "Accept"}
	config.AllowCredentials = true
	return cors.New(config)
}
