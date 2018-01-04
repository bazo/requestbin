package main

import (
	"crypto/tls"
	"encoding/binary"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/GeertJohan/go.rice"
	"github.com/boltdb/bolt"
	"github.com/jinzhu/configor"
	"github.com/julienschmidt/httprouter"
	uuid "github.com/satori/go.uuid"
	hashids "github.com/speps/go-hashids"
)

type (
	//app config
	Config struct {
		Port   string `default:"8100"`
		DbName string `default:"requestbin.bolt"`
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
		Time             time.Time
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

func createIdHasher() *hashids.HashID {
	hd := hashids.NewData()
	hd.Salt = "WLIXFjh8d3foEoKxqjif"
	hd.MinLength = 5
	return hashids.NewWithData(hd)
}

func hashId(v int) string {
	hd := createIdHasher()
	id, _ := hd.Encode([]int{v})
	return id
}

func decodeHashId(hash string) (int, error) {
	hd := createIdHasher()
	d, err := hd.DecodeWithError(hash)
	if err != nil {
		return -1, err
	}
	if len(d) != 0 {
		return d[0], err
	}

	return -1, errors.New("Hash not decoded")
}

func loadConfig() {
	configFile := flag.String("file", "requestbin.yml", "configuration file")
	configor.Load(&config, *configFile)
}

func encodeRequest(r *http.Request) ([]byte, error) {
	//if r.Header.Get("Content-Type") == "application/x-www-form-urlencoded" {
	r.ParseForm()
	//}

	body, _ := ioutil.ReadAll(r.Body)

	contentType := r.Header.Get("Content-Type")

	req := &RequestStruct{
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

	return json.Marshal(req)
}

func requestHandler(w http.ResponseWriter, r *http.Request, binName string, db *bolt.DB) {
	var id uint64
	err := db.Update(func(tx *bolt.Tx) error {
		bucketId := []byte(binName)
		_, err := tx.CreateBucketIfNotExists(bucketId)
		if err != nil {
			return fmt.Errorf("create bucket: %s", err)
		}

		b := tx.Bucket(bucketId)

		id, _ = b.NextSequence()

		req, err := encodeRequest(r)

		if err != nil {
			return err
		}

		return b.Put(itob(int(id)), req)
	})

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(err)
	} else {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("X-Request-Id", fmt.Sprintf("%d", int(id)))
	}

}

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

func loadBinRequestsHandler(w http.ResponseWriter, r *http.Request, params httprouter.Params, db *bolt.DB) {

	binName := params.ByName("binName")

	requests := make([]*RequestStruct, 0)

	db.View(func(tx *bolt.Tx) error {
		// Assume bucket exists and has keys
		b := tx.Bucket([]byte(binName))

		if b == nil {
			return nil
		}

		b.ForEach(func(k, v []byte) error {
			req := &RequestStruct{}
			json.Unmarshal(v, req)
			requests = append(requests, req)
			return nil
		})

		return nil
	})

	sort.SliceStable(requests, func(i, j int) bool {
		return requests[j].Time.Before(requests[i].Time)
	})

	json.NewEncoder(w).Encode(requests)
}

func binMiddleware(handler http.Handler, db *bolt.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		binName := strings.TrimPrefix(r.URL.Path, "/")

		//binBytes, err := findBin(binName, db)
		_, err := findBin(binName, db)

		if err == nil {
			//bin := &Bin{}
			//json.Unmarshal(binBytes.([]byte), bin)
			//log.Println(bin)
			//json.NewEncoder(w).Encode(bin)

			requestHandler(w, r, binName, db)
		} else {
			handler.ServeHTTP(w, r)
		}
	})
}

func findBin(binName string, db *bolt.DB) (interface{}, error) {
	var result []byte
	id, err := decodeHashId(binName)

	if err != nil {
		return result, err
	}

	db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("bins"))
		v := b.Get(itob(id))
		fmt.Printf("The answer is: %s\n", v)

		if v != nil {
			result = make([]byte, len(v))
			//copy(v, result)
			result = v
		} else {
			result = nil
		}
		return nil
	})

	return result, nil
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

	fileHandler := func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		http.FileServer(box.HTTPBox()).ServeHTTP(w, r)
	}

	http.Handle("/", http.FileServer(box.HTTPBox()))
	http.Handle("/inspect", http.FileServer(box.HTTPBox()))

	log.Println("starting server on port", config.Port)

	router := httprouter.New()
	//router.GET("/", http.FileServer(box.HTTPBox()))

	router.POST("/api/bins", dbHandler(createBinHandler))
	router.GET("/api/bins", dbHandler(loadBinsHandler))

	router.GET("/api/bins/:binName/requests", dbHandler(loadBinRequestsHandler))

	router.GET("/", fileHandler)

	router.HandleMethodNotAllowed = false
	router.NotFound = func(w http.ResponseWriter, r *http.Request) {
		http.FileServer(box.HTTPBox()).ServeHTTP(w, r)
	}

	log.Fatal(http.ListenAndServe(":"+config.Port, binMiddleware(router, db)))
}
