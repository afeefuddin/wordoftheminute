FROM golang:1.23-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY go.mod .
COPY go.sum .
RUN go mod download

COPY . .

RUN go build -o  /app/wordoftheminute .

EXPOSE 8000

CMD [ "./wordoftheminute" ]
