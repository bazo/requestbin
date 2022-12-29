package api

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"requestbin/types"
	"strconv"

	"github.com/uptrace/bunrouter"
)

// func dbHandler(handler func(w http.ResponseWriter, r *http.Request, params httprouter.Params, db *bolt.DB)) func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
// 	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
// 		handler(w, r, params, db)
// 	}
// }

// func stormHandler(handler func(w http.ResponseWriter, r *http.Request, params httprouter.Params, stormDb *storm.DB)) func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
// 	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
// 		handler(w, r, params, stormDb)
// 	}
// }

func (api *Api) RequestHandler(w http.ResponseWriter, r *http.Request, binName string) {
	data, err := api.storage.SaveRequest(binName, r)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(err)
	} else {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("X-Request-Id", data.ID)
	}

}

func (api *Api) DefaultRequestHandler(w http.ResponseWriter, r *http.Request) {
	binName := "default"
	data, err := api.storage.SaveRequest(binName, r)

	if err != nil {
		createErrorResponse(w, err, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Request-Id", data.ID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)

}

func (api *Api) CreateBinHandler(w http.ResponseWriter, r *http.Request) {
	bin, _ := api.storage.CreateBin()
	log.Println(bin)
	json.NewEncoder(w).Encode(bin)
}

func (api *Api) LoadBinsHandler(w http.ResponseWriter, r *http.Request) {

	bins, err := api.storage.LoadBins()

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(err)
	} else {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(bins)
	}

}

func (api *Api) LoadBinRequestsHandler(w http.ResponseWriter, r *http.Request) {
	params := bunrouter.ParamsFromContext(r.Context())

	binID, ok := params.Get("id")

	if !ok {
		createErrorResponse(w, fmt.Errorf("id not provided"), http.StatusBadRequest)
		return
	}

	page, err := strconv.ParseInt(r.URL.Query().Get("page"), 10, 64)

	if err != nil {
		page = 1
	} else {
		if page < 1 {
			page = 1
		}
	}

	limit, err := strconv.ParseInt(r.URL.Query().Get("maxPerPage"), 10, 64)

	if err != nil {
		limit = 50
	} else {
		if limit < 0 {
			limit = 50
		}
	}

	requests, total, err := api.storage.LoadRequestsInBin(binID, page, limit)

	if err != nil {
		createErrorResponse(w, err, http.StatusInternalServerError)
		return
	}

	var pagesCount int64

	x := float64(total) / float64(limit)

	pagesCount = int64(math.Ceil(x))

	response := types.RequestsResponse{
		BinID:      binID,
		Page:       page,
		PagesCount: pagesCount,
		Requests:   requests,
	}

	json.NewEncoder(w).Encode(response)
}
