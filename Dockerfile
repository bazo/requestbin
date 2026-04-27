FROM oven/bun:alpine AS ui-builder

WORKDIR /app/ui
COPY ui/package.json ui/bun.lock* ./
RUN bun install --frozen-lockfile
COPY ui/ .
RUN bun run build

FROM golang:1.26-alpine AS builder

ARG APP_NAME=requestbin

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=ui-builder /app/ui/dist ./ui/dist

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o ${APP_NAME} .

FROM scratch

ENV HOST=0.0.0.0
ENV PORT=8100
ENV DB_NAME=requestbin.bolt
ENV SALT=somerandomsecretsalt

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /src/requestbin /requestbin

ENTRYPOINT ["/requestbin"]
