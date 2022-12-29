package api

import (
	"encoding/json"
	"log"
	"net/http"
	"requestbin/storage"
)

type Api struct {
	storage *storage.Storage
}

func NewApi(storage *storage.Storage) *Api {
	return &Api{
		storage,
	}
}

func createErrorResponse(w http.ResponseWriter, err error, code int) {
	log.Println(err)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(err)
}
