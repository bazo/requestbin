# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

RequestBin — a self-hosted HTTP request capture and inspection tool. Send any HTTP request to a bin endpoint; view captured requests in a React UI. Data stored in BoltDB (embedded, file-based).

## Architecture

Two separate processes that run together in development:

**Go backend** (root directory) — bunrouter HTTP server on port 8100.
- `main.go` — config loading, router setup, static file serving via go.rice
- `api/` — HTTP handlers (`handlers.go`) and middleware. `Api` struct holds a `*storage.Storage`
- `storage/` — BoltDB + Storm wrapper. Each bin is a bolt bucket; requests are JSON-encoded values with sequence keys. Pagination uses Storm's `Select().Limit().Skip().OrderBy().Reverse()` + `RawEach`
- `types/` — shared types: `Config`, `RequestStruct`, `Bin`, `RequestsResponse`
- `hasher/` — HashID-based bin ID generation (go-hashids with configurable salt)
- `helpers/` — `http.Request` → `RequestStruct` conversion, int-to-bytes encoding

**React frontend** (`ui/` directory) — Vite + React 19 + TypeScript + Tailwind CSS 4. Separate bun-managed project.
- Uses react-query for data fetching against `/api/*` endpoints
- Vite proxies `/api` to the Go backend during dev (configured in root `vite.config.ts`)
- Components: `app.tsx` (main), `binList.tsx`, `requestsList.tsx`, `pagination.tsx`, `code.tsx`, `hideText.tsx`

**Legacy frontend** (root `package.json`) — older React setup with Bootstrap/SASS, yarn 3. Being replaced by `ui/`.

## Development Commands

### Backend (Go)
```bash
# Run with hot-reload (air)
air

# Build manually
go build -o ./tmp/main .

# Config file (YAML) — defaults to requestbin.yml
# Default port: 8100, default DB: requestbin.bolt
```

### Frontend (`ui/` directory)
```bash
cd ui
bun install
bun run dev        # Vite dev server
bun run build      # tsc -b && vite build
bun run lint       # eslint
```

### Formatting & Linting (UI)
- **Formatter:** oxfmt — tabs, tab width 4, LF line endings (`.oxfmtrc.json`)
- **Linter:** oxlint with react/typescript/import plugins (`.oxlintrc.json`)
- **ESLint:** also configured with react-hooks and react-refresh plugins

## Code Style

- **Go:** standard library style, no tests currently in the repo
- **TypeScript/React:** tabs for indentation (editorconfig + oxfmt), tab width 4, LF endings
- **Frontend state:** react-query for server state, useState for local UI state

## API Endpoints

- `POST /api/bins` — create a new bin
- `GET /api/bins` — list all bins
- `GET /api/bins/:id?page=N&maxPerPage=N` — get paginated requests for a bin
- `GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS /` — capture request to the "default" bin

## Key Details

- Config loaded via `configor` from `requestbin.yml` (gitignored). Fields: `Port`, `DbName`, `Salt`
- BoltDB file (`*.bolt`) is gitignored
- go.rice embeds the `dist/` directory for production static file serving
- The `ui/` directory is a new separate project (bun + Vite + Tailwind) replacing the root-level legacy frontend
