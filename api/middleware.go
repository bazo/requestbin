package api

import (
	"net/http"
	"strings"
)

func (api *Api) BinMiddleware(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		binName := strings.TrimPrefix(r.URL.Path, "/")

		_, err := api.storage.FindBin(binName)

		if err == nil {
			api.RequestHandler(w, r, binName)
		} else {
			handler.ServeHTTP(w, r)
		}
	})
}
