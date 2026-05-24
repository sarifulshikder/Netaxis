package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"net/url"
	"log"
)

// CORSMiddleware sets up CORS configuration for the Gin router.
// It validates the frontendURL and restricts origins unless explicitly allowed.
// If frontendURL is "*", all origins are allowed (not recommended for production).
func CORSMiddleware(frontendURL string) gin.HandlerFunc {
	config := cors.DefaultConfig()

	if frontendURL == "*" || frontendURL == "" {
		// Allowing all origins is insecure for production.
		config.AllowAllOrigins = true
		log.Println("[WARNING] CORS: Allowing all origins. This is insecure for production environments.")
	} else {
		// Validate the frontendURL to ensure it's a valid URL.
		_, err := url.ParseRequestURI(frontendURL)
		if err != nil {
			log.Printf("[ERROR] CORS: Invalid frontendURL '%s'. Falling back to AllowAllOrigins.\n", frontendURL)
			config.AllowAllOrigins = true
		} else {
			config.AllowOrigins = []string{frontendURL}
		}
	}

	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Authorization", "Content-Type", "X-Tenant-ID", "Accept"}
	config.ExposeHeaders = []string{"Content-Disposition"} // Expose for file downloads
	config.AllowCredentials = true
	config.MaxAge = 12 * 60 * 60 // 12 hours

	return cors.New(config)
}
