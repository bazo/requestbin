package main

import (
	"flag"
	"log"
	"net/http"
	"requestbin/api"
	"requestbin/hasher"
	"requestbin/storage"
	"requestbin/types"

	rice "github.com/GeertJohan/go.rice"

	"github.com/jinzhu/configor"
	"github.com/uptrace/bunrouter"
	"github.com/uptrace/bunrouter/extra/reqlog"
)

var config types.Config

func loadConfig() {
	configFile := flag.String("file", "requestbin.yml", "configuration file")
	configor.Load(&config, *configFile)
}

func main() {
	loadConfig()

	hasher := hasher.NewHasher(config.Salt)
	storage := storage.NewStorage(hasher)
	defer storage.Close()
	err := storage.Init(config.DbName)

	if err != nil {
		log.Fatal("Opening db: ", err)
	}

	box := rice.MustFindBox("build")

	inspectAppPath := "/app"
	api := api.NewApi(storage)
	fileServer := http.StripPrefix(inspectAppPath, http.FileServer(box.HTTPBox()))
	log.Println(fileServer)

	router := bunrouter.New(
		bunrouter.Use(reqlog.NewMiddleware(
			reqlog.FromEnv("BUNDEBUG"),
		)),
	).Compat()

	router.GET("/", api.DefaultRequestHandler)
	router.POST("/", api.DefaultRequestHandler)
	router.PATCH("/", api.DefaultRequestHandler)
	router.DELETE("/", api.DefaultRequestHandler)
	router.HEAD("/", api.DefaultRequestHandler)
	router.OPTIONS("/", api.DefaultRequestHandler)
	router.PUT("/", api.DefaultRequestHandler)

	router.WithGroup("/api", func(g *bunrouter.CompatGroup) {
		g.GET("/bins/:id", api.LoadBinRequestsHandler)
		g.GET("/bins", api.LoadBinsHandler)
		g.POST("/bins", api.CreateBinHandler)

	})

	//http.Handle(inspectAppPath, fileServer)

	log.Println("starting server on port", config.Port)
	log.Fatal(http.ListenAndServe(":"+config.Port, router))
}
