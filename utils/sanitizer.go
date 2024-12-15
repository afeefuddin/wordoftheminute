package utils

import (

	"github.com/afeefuddin/wordoftheminute/internal/database"
)

type Word struct {
	Timestamp string 
	First     string 
	Second    string 
	Third     string 
}

func DbWordToWord(data []database.Wordoftheminute) []Word {
	words := []Word{}
	for _, val := range data {
		var word Word = Word{
			Timestamp: val.ID,
		}

		if val.First.Valid {
			word.First = val.First.String
		}

		if val.Second.Valid {
			word.Second = val.Second.String
		}

		if val.Third.Valid {
			word.Third = val.Third.String
		}

		words = append(words, word)

	}
	return words
}
