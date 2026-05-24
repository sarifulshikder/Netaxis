package database

import (
	"context"
	"errors"
	"fmt"
	"github.com/redis/go-redis/v9"
)

// NewRedisDB creates a new Redis client and tests the connection.
// Returns (*redis.Client, error) instead of panicking or exiting the process.
func NewRedisDB(url string) (*redis.Client, error) {
	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	rdb := redis.NewClient(opts)

	// Test connection with timeout for better performance and reliability
	ctx, cancel := context.WithTimeout(context.Background(), opts.DialTimeout)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return rdb, nil
}
