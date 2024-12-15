package utils

import "github.com/google/uuid"

func GenerateSessionID() string {
	val := uuid.New()

	uuidString := val.String()

	return uuidString
}
