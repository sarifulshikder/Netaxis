package services

import (
	"log"
	"net/http"
	"net/url"
)

type SMSService struct {
	enabled bool
	apiURL  string
	apiKey  string
}

func NewSMSService(enabled bool, apiURL, apiKey string) *SMSService {
	return &SMSService{enabled: enabled, apiURL: apiURL, apiKey: apiKey}
}

func (s *SMSService) SendSMS(to, message string) error {
	if !s.enabled {
		log.Printf("[SMS MOCK] To: %s | Msg: %s", to, message)
		return nil
	}

	// Example implementation for a typical HTTP API gateway
	params := url.Values{}
	params.Add("api_key", s.apiKey)
	params.Add("to", to)
	params.Add("msg", message)

	resp, err := http.Get(s.apiURL + "?" + params.Encode())
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}
