package main

import (
	"crypto/tls"
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
)

var config Config

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

func Index(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprint(w, "Welcome!\n")
}

func Hello(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	fmt.Fprintf(w, "hello, %s!\n", ps.ByName("name"))
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

	/*
		dbHandler := func(handler func(w http.ResponseWriter, r *http.Request, db *mgo.Database)) func(w http.ResponseWriter, r *http.Request) {
			return func(w http.ResponseWriter, r *http.Request) {
				handler(w, r, db)
			}
		}
	*/

	box := rice.MustFindBox("build")
	log.Print(box)

	//http.HandleFunc("/apps", dbHandler(GetAppsHandler))
	//http.HandleFunc("/actions", dbHandler(GetActionsHandler))
	//http.HandleFunc("/logs", dbHandler(GetLogsHandler))
	http.HandleFunc("/r", requestHandler)
	http.Handle("/", http.FileServer(box.HTTPBox()))
	http.Handle("/inspect", http.FileServer(box.HTTPBox()))

	log.Println("starting server on port", config.Port)

	router := httprouter.New()
	router.GET("/", Index)
	router.GET("/hello/:name", Hello)

	log.Fatal(http.ListenAndServe(":"+config.Port, router))
}
