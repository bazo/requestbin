package types

import (
	"crypto/tls"
	"mime/multipart"
	"net/http"
	"net/url"
	"time"
)

type (
	Config struct {
		Port   string `default:"8100"`
		DbName string `default:"requestbin.bolt"`
		Salt   string `default:"omfgthisissogreat"`
	}

	RequestStruct struct {
		ID               string
		Method           string
		URL              *url.URL
		Proto            string // "HTTP/1.0"
		ProtoMajor       int    // 1
		ProtoMinor       int    // 0
		Header           http.Header
		ContentType      string
		Body             string
		ContentLength    int64
		TransferEncoding []string
		Host             string
		Form             url.Values
		PostForm         url.Values
		MultipartForm    *multipart.Form
		Trailer          http.Header
		RemoteAddr       string
		RequestURI       string
		TLS              *tls.ConnectionState
		Time             time.Time
	}

	Bin struct {
		ID string
	}

	RequestsResponse struct {
		BinID      string           `json:"binID"`
		Page       int64            `json:"page"`
		PagesCount int64            `json:"pagesCount"`
		Requests   []*RequestStruct `json:"requests"`
	}
)
