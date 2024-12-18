package utils

import (
	"strings"
	"unicode"
)

func CleanseWord(word string) string {
	var cleaned strings.Builder

	for _, char := range word {
		if unicode.IsLetter(char) {
			cleaned.WriteRune(unicode.ToLower(char))
		}
	}

	return cleaned.String()
}
