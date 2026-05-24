package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/utils"
	"github.com/redis/go-redis/v9"
)

func RateLimitMiddleware(rdb *redis.Client, limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		// Use RemoteIP for more accurate client IP, fallback to ClientIP
		clientIP := c.RemoteIP()
		if clientIP == "" {
			clientIP = c.ClientIP()
		}
		// Optionally, include path for more granular rate limiting
		key := fmt.Sprintf("ratelimit:%s:%s", clientIP, c.FullPath())

		count, err := rdb.Incr(ctx, key).Result()
		if err != nil {
			// Log the error and return 503 Service Unavailable
			fmt.Printf("Redis error in RateLimitMiddleware: %v\n", err)
			utils.Error(c, http.StatusServiceUnavailable, "Rate limit service unavailable", nil)
			c.Abort()
			return
		}

		if count == 1 {
			_, expireErr := rdb.Expire(ctx, key, window).Result()
			if expireErr != nil {
				fmt.Printf("Redis expire error in RateLimitMiddleware: %v\n", expireErr)
				// Optionally, abort or continue
			}
		}

		if count > int64(limit) {
			utils.Error(c, http.StatusTooManyRequests, "Too many requests", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}
