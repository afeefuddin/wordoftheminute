package main

import (
	"net/http"
	"time"

	"github.com/afeefuddin/wordoftheminute/utils"
)

func cookieMiddleware(next http.Handler) http.Handler {
	cookieName := "x-wotm-id"
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		cookie, err := r.Cookie(cookieName)

		if err == http.ErrNoCookie || cookie == nil {
			newCookie := &http.Cookie{
				Name:     cookieName,
				Value:    utils.GenerateSessionID(),
				Path:     "/",
				Expires:  time.Now().Add(24 * time.Hour),
				HttpOnly: true,
				Secure:   true,
				SameSite: http.SameSiteNoneMode,
			}
			http.SetCookie(w, newCookie)
			r.AddCookie(newCookie)
		}

		next.ServeHTTP(w, r)
	})
}
