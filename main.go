package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"requestbin/api"
	"requestbin/hasher"
	"requestbin/storage"
	"requestbin/types"

	"github.com/joho/godotenv"
	"github.com/uptrace/bunrouter"
	"github.com/uptrace/bunrouter/extra/reqlog"
)

//go:embed ui/dist
var embeddedFiles embed.FS

var config types.Config

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func loadConfig() {
	appEnv := envOrDefault("APP_ENV", "development")

	// Load in priority order: godotenv won't overwrite existing keys,
	// so higher-priority files must come first.
	envFiles := []string{
		".env." + appEnv + ".local",
		".env.local",
		".env." + appEnv,
		".env",
	}

	var filesToLoad []string
	for _, f := range envFiles {
		if _, err := os.Stat(f); err == nil {
			filesToLoad = append(filesToLoad, f)
		}
	}
	if len(filesToLoad) > 0 {
		godotenv.Load(filesToLoad...)
	}

	config = types.Config{
		Host:   envOrDefault("HOST", "0.0.0.0"),
		Port:   envOrDefault("PORT", "8100"),
		DbName: envOrDefault("DB_NAME", "requestbin.bolt"),
		Salt:   envOrDefault("SALT", "omfgthisissogreat"),
	}
}

func serveStatic(fileServer http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fileServer.ServeHTTP(w, r)
	}
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

	distFS, err := fs.Sub(embeddedFiles, "ui/dist")
	if err != nil {
		log.Fatal("Embedding ui/dist: ", err)
	}

	inspectAppPath := "/app"
	api := api.NewApi(storage)

	fileServer := http.FileServer(http.FS(distFS))

	router := bunrouter.New(
		bunrouter.Use(reqlog.NewMiddleware(
			reqlog.FromEnv("BUNDEBUG"),
		)),
	).Compat()

	router.GET("/assets/*path", func(w http.ResponseWriter, r *http.Request) {
		http.StripPrefix("/", fileServer).ServeHTTP(w, r)
	})

	router.GET("/logo.svg", serveStatic(fileServer))
	router.GET("/favicon.svg", serveStatic(fileServer))

	router.GET(inspectAppPath, func(w http.ResponseWriter, r *http.Request) {
		http.StripPrefix(inspectAppPath, fileServer).ServeHTTP(w, r)
	})

	router.GET("/*id", api.DefaultRequestHandler)
	router.POST("/*id", api.DefaultRequestHandler)
	router.PATCH("/*id", api.DefaultRequestHandler)
	router.DELETE("/*id", api.DefaultRequestHandler)
	router.HEAD("/*id", api.DefaultRequestHandler)
	router.OPTIONS("/*id", api.DefaultRequestHandler)
	router.PUT("/*id", api.DefaultRequestHandler)

	router.WithGroup("/api", func(g *bunrouter.CompatGroup) {
		g.GET("/bins/:id", api.LoadBinRequestsHandler)
		g.GET("/bins", api.LoadBinsHandler)
		g.POST("/bins", api.CreateBinHandler)
	})

	addr := config.Host + ":" + config.Port
	log.Println("starting server on", addr)
	log.Fatal(http.ListenAndServe(addr, router))
}
