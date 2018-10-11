FROM golang:alpine AS builder

RUN apk update && apk add --upgrade --no-cache git nodejs-current yarn ca-certificates upx python2 binutils
RUN go get -u github.com/golang/dep/cmd/dep github.com/GeertJohan/go.rice/rice

VOLUME $GOPATH/pkg/dep

ARG APP_NAME="requestbin"
ARG SRC=.
ARG DEST=/go/src/${APP_NAME}/

WORKDIR ${DEST}

COPY Gopkg.toml Gopkg.lock ./
RUN dep ensure -vendor-only

COPY package.json yarn.lock ./

RUN yarn

COPY ${SRC} ${DEST}
RUN yarn build

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -ldflags="-w -s" -o ${APP_NAME}  .

RUN strip --strip-unneeded ${APP_NAME}
RUN upx ${APP_NAME}

FROM scratch

ARG APP_NAME="requestbin"
ENV APP_CMD "./${APP_NAME}"

COPY --from=builder /go/src/${APP_NAME}/${APP_NAME} .
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

CMD ${APP_NAME}}
