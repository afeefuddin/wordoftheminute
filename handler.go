package main

import (
	"net/http"

	"github.com/afeefuddin/wordoftheminute/utils"
)

func handlerReadiness(w http.ResponseWriter, r *http.Request) {
	utils.JsonResponse(w, 200, struct{}{})
}
