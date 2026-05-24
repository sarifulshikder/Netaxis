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
		path := c.Request.URL.Path

		log.Printf("[GIN] %v | %3d | %13v | %s %s",
			t.Format("2006/01/02 - 15:04:05"),
			status,
			latency,
			method,
			path,
		)
	}
}
