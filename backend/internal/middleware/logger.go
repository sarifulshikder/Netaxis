package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()

		c.Next()

		latency := time.Since(t)
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.String()
		clientIP := c.ClientIP()
		userAgent := c.Request.UserAgent()
		var errors string
		if len(c.Errors) > 0 {
			errors = c.Errors.String()
		}

		log.Printf("[GIN] %v | %3d | %13v | %s %s | IP: %s | UA: %s | ERR: %s",
			t.Format("2006/01/02 - 15:04:05"),
			status,
			latency,
			method,
			path,
			clientIP,
			userAgent,
			errors,
		)
	}
}
