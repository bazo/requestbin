package main

import (
	"crypto/tls"
	"encoding/binary"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"time"

	"github.com/GeertJohan/go.rice"
	"github.com/boltdb/bolt"
	"github.com/jinzhu/configor"
	"github.com/julienschmidt/httprouter"
	"github.com/speps/go-hashids"
)

type (
	//app config
	Config struct {
		Port   string `default:"8000"`
		DbName string `default:"requestbin.bolt"`
	}

	RequestStruct struct {
		Method           string
		URL              *url.URL
		Proto            string // "HTTP/1.0"
		ProtoMajor       int    // 1
		ProtoMinor       int    // 0
		Header           http.Header
		Body             string //io.ReadCloser
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
	}

	Bin struct {
		ID     int
		HashId string
	}
)

var config Config

func itob(v int) []byte {
	b := make([]byte, 8)
	binary.BigEndian.PutUint64(b, uint64(v))
	return b
}

func hashId(v int) string {
	hd := hashids.NewData()
	hd.Salt = "WLIXFjh8d3foEoKxqjif"
	hd.MinLength = 5
	h := hashids.NewWithData(hd)
	id, _ := h.Encode([]int{v})
	return id
}

func loadConfig() {
	configFile := flag.String("file", "config.yml", "configuration file")
	configor.Load(&config, *configFile)
}

func requestHandler(w http.ResponseWriter, r *http.Request) {

	//if r.Header.Get("Content-Type") == "application/x-www-form-urlencoded" {
	r.ParseForm()
	//}

	log.Println(r)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	body, _ := ioutil.ReadAll(r.Body)

	req := &RequestStruct{
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
	}

	log.Println(json.Marshal(req))

	json.NewEncoder(w).Encode(req)
}

/*
func dbHandler(handler func(w http.ResponseWriter, r *http.Request, params httprouter.Params, db *bolt.DB)) func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		handler(w, r, params, db)
	}
}
*/

func createBinHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params, db *bolt.DB) {
	bin, _ := createBin(db)

	json.NewEncoder(w).Encode(bin)
}

func loadBinsHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params, db *bolt.DB) {

	var bins []*Bin

	db.View(func(tx *bolt.Tx) error {
		// Assume bucket exists and has keys
		b := tx.Bucket([]byte("bins"))

		b.ForEach(func(k, v []byte) error {
			bin := &Bin{}
			json.Unmarshal(v, bin)
			bins = append(bins, bin)
			return nil
		})
		return nil
	})

	json.NewEncoder(w).Encode(bins)
}

func binMiddleware(handler http.Handler, db *bolt.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/tom" {
			// do something for tom
		}
		handler.ServeHTTP(w, r)
	})
}

func createBin(db *bolt.DB) (*Bin, error) {

	bin := &Bin{}

	err := db.Update(func(tx *bolt.Tx) error {
		// Retrieve the users bucket.
		// This should be created when the DB is first opened.
		b := tx.Bucket([]byte("bins"))

		// Generate ID for the user.
		// This returns an error only if the Tx is closed or not writeable.
		// That can't happen in an Update() call so I ignore the error check.
		id, _ := b.NextSequence()

		bin.ID = int(id)
		bin.HashId = hashId(int(id))

		// Marshal user data into bytes.
		buf, err := json.Marshal(bin)
		if err != nil {
			return err
		}

		// Persist bytes to users bucket.
		return b.Put(itob(bin.ID), buf)
	})

	return bin, err
}

func main() {
	loadConfig()

	db, err := bolt.Open(config.DbName, 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte("bins"))
		if err != nil {
			return fmt.Errorf("create bucket: %s", err)
		}
		return nil
	})

	dbHandler := func(handler func(w http.ResponseWriter, r *http.Request, params httprouter.Params, db *bolt.DB)) func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
			handler(w, r, params, db)
		}
	}

	box := rice.MustFindBox("build")
	log.Print(box)

	fileHandler := func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		http.FileServer(box.HTTPBox()).ServeHTTP(w, r)
	}

	//http.HandleFunc("/apps", dbHandler(GetAppsHandler))
	//http.HandleFunc("/actions", dbHandler(GetActionsHandler))
	//http.HandleFunc("/logs", dbHandler(GetLogsHandler))
	http.HandleFunc("/r", requestHandler)
	http.Handle("/", http.FileServer(box.HTTPBox()))
	http.Handle("/inspect", http.FileServer(box.HTTPBox()))

	log.Println("starting server on port", config.Port)

	router := httprouter.New()
	//router.GET("/", http.FileServer(box.HTTPBox()))

	router.POST("/api/bins", dbHandler(createBinHandler))
	router.GET("/api/bins", dbHandler(loadBinsHandler))

	router.GET("/", fileHandler)

	router.HandleMethodNotAllowed = false
	router.NotFound = func(w http.ResponseWriter, r *http.Request) {
		http.FileServer(box.HTTPBox()).ServeHTTP(w, r)
	}

	log.Fatal(http.ListenAndServe(":"+config.Port, binMiddleware(router, db)))
}
