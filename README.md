# RequestBin

A self-hosted HTTP request capture and inspection tool. Send any HTTP request to a bin endpoint, then browse the captured payloads in a React UI. Useful for debugging webhooks, third-party integrations, or anything that POSTs to a URL you don't fully control.

## Why this exists

I needed a webhook inspector I could run on my own infrastructure — public RequestBin-style services churn data after a few hours and add a third party to flows that often carry sensitive headers (signed payloads, auth tokens, etc.). The goals were small and explicit:

- **Single binary** to deploy. No language runtime, no external database, no sidecar.
- **No accounts, no auth, no multi-tenancy.** It runs behind my own ingress; whoever can reach it can use it.
- **Embedded storage.** I don't want to operate Postgres for a debugging tool.
- **Modern, fast UI** that I'd actually want to use.

These constraints drove every architectural decision below.

## Architecture

```
   ┌────────────┐    HTTP request    ┌───────────────────────────┐
   │ Any client │ ─────────────────▶ │  Go server (bunrouter)    │
   └────────────┘                    │                           │
                                     │  /api/*  → JSON API       │
                                     │  /*      → capture handler│
                                     │  /       → embedded UI    │
                                     └────────────┬──────────────┘
                                                  │
                                                  ▼
                                     ┌───────────────────────────┐
                                     │  BoltDB (single .bolt file)│
                                     │  - one bucket per bin      │
                                     │  - sequence-keyed entries  │
                                     └───────────────────────────┘
```

One Go process serves three things on a single port (default `8100`):

1. **Capture endpoint** — any non-`/api` request is recorded into the `default` bin. The request line, headers, body, form data and remote addr are converted into a `RequestStruct` (`helpers/`) and persisted.
2. **JSON API** — `POST /api/bins`, `GET /api/bins`, `GET /api/bins/:id?page=N&maxPerPage=N`. Bin IDs are HashID-encoded (`hasher/`) so they're short, opaque, and don't leak insertion order.
3. **Static UI** — the React build is embedded into the binary at compile time via `embed.FS`. No separate web server, no path mapping in production.

### Why these choices

**Go + BoltDB instead of Node + SQLite/Postgres.** The whole tool is essentially "write request blobs, list them paginated." No relational queries, no schema evolution. BoltDB gives me an embedded, transactional B+tree in one file with zero operational overhead. Storm sits on top of it for indexed queries and pagination (`Select().Limit().Skip().OrderBy().Reverse()`). The Go binary is statically linked and ships in a `FROM scratch` image — final image is a few MB.

**bunrouter over chi/gin/stdlib.** Lower allocation than gin, less ceremony than chi, integrates cleanly with `reqlog`. For a service whose entire job is to receive requests, the router is on the hot path — using a fast one is a free win. The choice isn't load-bearing; the routes would migrate to anything in an afternoon.

**One bucket per bin, sequence keys.** Each bin maps to a Bolt bucket; each captured request gets a monotonically increasing sequence as its key. This makes "list newest first, paginated" a `Reverse()` cursor scan with no secondary index. It also means deleting a bin is `DeleteBucket` — a single op, not a `DELETE WHERE`.

**Embedded UI, not a separate frontend service.** `go:embed ui/dist` means production is one binary, one port, one process. No CORS, no reverse-proxy config, no "which container serves what." During development the React app runs on Vite's dev server and proxies `/api` to the Go process — same wire format, different transport.

**No auth.** Adding auth would mean sessions, password storage, recovery flows — for a tool designed to live behind a Tailscale node or internal ingress, that's user-hostile. If you need auth, put it at the ingress.

### Trade-offs I accepted

- **Single-writer.** BoltDB takes a process-wide write lock. Fine for a debugging tool; would be wrong for a multi-tenant SaaS. If the tool ever needed to scale out, the storage layer is the rewrite, not the rest.
- **No retention policy.** The DB grows until you delete the file. Adding TTL would be ~30 lines but I wanted to ship the smallest thing that works.
- **No request body size limit.** A misbehaving caller can fill the disk. Acceptable behind trusted ingress; a hard cap is on the list.

## Project layout

```
.
├── main.go                  # config loading, router setup, embed
├── api/                     # HTTP handlers and middleware
├── storage/                 # BoltDB + Storm wrapper (one file per concern)
├── hasher/                  # HashID-based bin ID generation
├── helpers/                 # http.Request → RequestStruct conversion
├── types/                   # Config, RequestStruct, Bin, RequestsResponse
├── ui/                      # React 19 + Vite + Tailwind v4 frontend
└── Dockerfile               # multi-stage: bun → go → scratch
```

## Configuration

Loaded from environment variables (with `.env`, `.env.local`, `.env.<APP_ENV>`, `.env.<APP_ENV>.local` support, in priority order):

| Var       | Default              | Purpose                                     |
| --------- | -------------------- | ------------------------------------------- |
| `HOST`    | `0.0.0.0`            | Bind address                                |
| `PORT`    | `8100`               | HTTP port                                   |
| `DB_NAME` | `requestbin.bolt`    | Bolt database file path                     |
| `SALT`    | (placeholder)        | HashID salt — change before deploying       |

## Running locally

You'll need Go 1.26+ and Bun.

**Backend** (with hot reload via [air](https://github.com/air-verse/air)):

```sh
air
# or, without air:
go run .
```

**Frontend** (separate terminal):

```sh
cd ui
bun install
bun run dev          # Vite dev server, proxies /api to :8100
```

Open `http://localhost:5173`. The capture endpoint is on the Go process at `http://localhost:8100/`.

For a production-style local run (UI baked into the binary):

```sh
cd ui && bun run build && cd ..
go build -o requestbin .
./requestbin
# everything served from http://localhost:8100
```

## Running with Docker

```sh
# build
docker build -t requestbin .

# run with persisted database
docker run --rm -p 8100:8100 \
  -v $(pwd)/data:/data \
  -e DB_NAME=/data/requestbin.bolt \
  -e SALT=$(openssl rand -hex 16) \
  requestbin
```

The `Dockerfile` is a three-stage build: `oven/bun:alpine` builds the UI, `golang:alpine` builds the static binary with `CGO_ENABLED=0`, and `FROM scratch` ships only the binary plus CA certs.

A multi-arch publish task is wired up in `Taskfile.yml`:

```sh
task docker:build      # local image
task docker:push       # buildx, linux/amd64 + linux/arm64, pushes to registry
```

## API

| Method                    | Path                                  | Purpose                       |
| ------------------------- | ------------------------------------- | ----------------------------- |
| `POST`                    | `/api/bins`                           | Create a new bin              |
| `GET`                     | `/api/bins`                           | List all bins                 |
| `GET`                     | `/api/bins/:id?page=N&maxPerPage=N`   | Paginated requests for a bin  |
| `GET\|POST\|PUT\|PATCH\|DELETE\|HEAD\|OPTIONS` | `/`              | Capture into the `default` bin|

## Stack

Go 1.26, [bunrouter](https://bun.uptrace.dev/guide/bunrouter.html), [Storm](https://github.com/asdine/storm) over [bbolt](https://github.com/etcd-io/bbolt), [go-hashids](https://github.com/speps/go-hashids). UI: React 19, Vite, TanStack Query, Tailwind v4, oxlint/oxfmt.
