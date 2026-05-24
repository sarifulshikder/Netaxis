package services

import (
	"log"
	"net/smtp"
)

type EmailService struct {
	enabled bool
	host    string
	port    string
	user    string
	pass    string
}

func NewEmailService(enabled bool, host, port, user, pass string) *EmailService {
	return &EmailService{
		enabled: enabled,
		host:    host,
		port:    port,
		user:    user,
		pass:    pass,
	}
}

func (s *EmailService) SendEmail(to, subject, body string) error {
	if !s.enabled {
		log.Printf("[EMAIL MOCK] To: %s | Sub: %s | Body: %s", to, subject, body)
		return nil
	}

	auth := smtp.PlainAuth("", s.user, s.pass, s.host)
	msg := []byte("To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" +
		body + "\r\n")

	err := smtp.SendMail(s.host+":"+s.port, auth, s.user, []string{to}, msg)
	return err
}
