package main

import (
	"context"
	"net/http"
	"strconv"

	"github.com/afeefuddin/wordoftheminute/internal/database"
	"github.com/afeefuddin/wordoftheminute/utils"
)

func handlerReadiness(w http.ResponseWriter, r *http.Request) {
	utils.JsonResponse(w, 200, struct{}{})
}

func handlerPastWords(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	page := query.Get("page")

	var offset int32 = 0

	if page != "" {
		val, err := strconv.Atoi(page)

		offset = int32(val)

		if err != nil {
			offset = 0
		}
	}

	data, err := DbClient.GetWords(context.Background(), database.GetWordsParams{
		Limit:  100,
		Offset: 100 * offset,
	})

	if err != nil {
		utils.JsonError(w, 500)
	}
	utils.JsonResponse(w, 200, utils.DbWordToWord(data))
}
