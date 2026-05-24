package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBURL           string
	DBUser          string
	DBPassword      string
	DBName          string
	RedisURL        string
	JWTSecret       string
	MinioEndpoint   string
	MinioAccessKey  string
	MinioSecretKey  string
	MinioBucket     string
	AppEnv          string
	AppPort         string
	FrontendURL     string
	SuperAdminEmail string
	SuperAdminPass  string
	SMSEnabled      string
	EmailEnabled    string
}

func LoadConfig() *Config {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	dbUrl := getEnv("DB_URL", "postgres://netaxis_admin:NetAxis@Secure2024@localhost:5432/netaxis?sslmode=disable")
	redisUrl := getEnv("REDIS_URL", "localhost:6379")
	log.Printf("Config Debug: DB_URL=%s, REDIS_URL=%s", dbUrl, redisUrl)

	return &Config{
		DBURL:           dbUrl,
		DBUser:          getEnv("DB_USER", "netaxis_admin"),
		DBPassword:      getEnv("DB_PASSWORD", "NetAxis@Secure2024"),
		DBName:          getEnv("DB_NAME", "netaxis"),
		RedisURL:        redisUrl,
		JWTSecret:       getEnv("JWT_SECRET", "netaxis-super-secret-jwt-key-2024"),
		MinioEndpoint:   getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinioAccessKey:  getEnv("MINIO_ACCESS_KEY", "netaxisadmin"),
		MinioSecretKey:  getEnv("MINIO_SECRET_KEY", "NetAxis@Minio2024"),
		MinioBucket:     getEnv("MINIO_BUCKET", "netaxis"),
		AppEnv:          getEnv("APP_ENV", "development"),
		AppPort:         getEnv("APP_PORT", "8080"),
		FrontendURL:     getEnv("FRONTEND_URL", "http://localhost:3000"),
		SuperAdminEmail: getEnv("SUPER_ADMIN_EMAIL", "admin@netaxis.local"),
		SuperAdminPass:  getEnv("SUPER_ADMIN_PASSWORD", "Admin@123456"),
		SMSEnabled:      getEnv("SMS_ENABLED", "false"),
		EmailEnabled:    getEnv("EMAIL_ENABLED", "false"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
