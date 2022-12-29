package helpers

import (
	"encoding/binary"
	"encoding/json"
	"io"
	"net/http"
	"requestbin/types"
	"time"

	uuid "github.com/satori/go.uuid"
)

func Itob(v int) []byte {
	b := make([]byte, 8)
	binary.BigEndian.PutUint64(b, uint64(v))
	return b
}

func RequestStruct(r *http.Request) *types.RequestStruct {
	contentType := r.Header.Get("Content-Type")

	r.ParseForm()
	body, _ := io.ReadAll(r.Body)

	s := &types.RequestStruct{
		ID:               uuid.NewV4().String(),
		Method:           r.Method,
		URL:              r.URL,
		Proto:            r.Proto,
		ProtoMajor:       r.ProtoMajor,
		ProtoMinor:       r.ProtoMinor,
		Header:           r.Header,
		Body:             string(body),
		ContentLength:    r.ContentLength,
		TransferEncoding: r.TransferEncoding,
		Host:             r.Host,
		Form:             r.Form,
		PostForm:         r.PostForm,
		MultipartForm:    r.MultipartForm,
		Trailer:          r.Trailer,
		RemoteAddr:       r.RemoteAddr,
		RequestURI:       r.RequestURI,
		TLS:              r.TLS,
		Time:             time.Now(),
		ContentType:      contentType,
	}

	//spew.Dump(s)
	return s
}

func EncodeRequest(r *http.Request) ([]byte, error) {
	return json.Marshal(RequestStruct(r))
}
