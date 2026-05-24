package utils

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

type ApiError struct {
	Field string `json:"field"`
	Msg   string `json:"message"`
}

func ValidateStruct(s interface{}) []ApiError {
	var errors []ApiError
	err := validate.Struct(s)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			var el ApiError
			el.Field = err.Field()
			el.Msg = msgForTag(err.Tag(), err.Param())
			errors = append(errors, el)
		}
	}
	return errors
}

func msgForTag(tag string, param string) string {
	switch tag {
	case "required":
		return "This field is required"
	case "email":
		return "Invalid email format"
	case "min":
		return fmt.Sprintf("Minimum length is %s", param)
	case "max":
		return fmt.Sprintf("Maximum length is %s", param)
	}
	return "Invalid value"
}
