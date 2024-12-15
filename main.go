package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/afeefuddin/wordoftheminute/internal/database"
	"github.com/afeefuddin/wordoftheminute/utils"
	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/go-co-op/gocron/v2"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

type webSocketServer struct {
	*sync.RWMutex
	connections      map[*websocket.Conn]bool
	connectionsCount int
}

var (
	RedisClient *redis.Client
	ctx         = context.Background()
	mbMap       *utils.MessageBatchMap
	broadCastCh chan string
	DbClient    *database.Queries
)

func (ws *webSocketServer) connect(conn *websocket.Conn) {
	ws.Lock()
	defer ws.Unlock()
	ws.connections[conn] = true
	ws.connectionsCount++
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func writeToRedis(clientId, word string) {
	curMin := utils.ThisMinute()

	clientKey := fmt.Sprintf("%v:%v", curMin, clientId)

	hasWritten, err := RedisClient.Get(ctx, clientKey).Result()

	if err == nil || hasWritten != "" {
		return
	}

	RedisClient.Set(ctx, clientKey, 1, 60*time.Second)

	// sorted set
	RedisClient.ZIncrBy(ctx, curMin, 1, word)

	mbMap.Write(string(word), utils.NextSecond())
}

func (ws *webSocketServer) broadCastEverySecond() {
	for data := range broadCastCh {
		ws.RWMutex.RLock()
		for conn := range ws.connections {
			conn.WriteJSON(data)
		}
		ws.RWMutex.RUnlock()
	}
}

func (ws *webSocketServer) webSocketHandler(w http.ResponseWriter, r *http.Request) {
	cookieData, err := r.Cookie("x-wotm-id")
	if err != nil {
		if err == http.ErrNoCookie {
			http.Error(w, "No cookie found", http.StatusUnauthorized)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	clientId := cookieData.Value

	cookie := &http.Cookie{
		Name:     "x-wotm-id",
		Value:    clientId,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}

	conn, err := upgrader.Upgrade(w, r, http.Header{
		"Set-Cookie": {cookie.String()},
	})
	if err != nil {
		log.Printf("Error connecting to the websocket server %v \n", err)
		return
	}

	ws.connect(conn)
	log.Println(listMessages())
	conn.WriteJSON(listMessages())

	defer func() {
		ws.Lock()
		delete(ws.connections, conn)
		ws.connectionsCount--
		ws.Unlock()

		conn.Close()
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}
		writeToRedis(clientId, string(message))
	}

}

func initDb() {
	host := os.Getenv("DB_URL")

	if host == "" {
		log.Fatal("DB_URL not found")
	}
	db, err := sql.Open("postgres", host)

	if err != nil {
		log.Fatal("Err connecting to db")
	}
	DbClient = database.New(db)
}

func initRedis() {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		log.Fatal("Redis host url not found")
	}
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		DB:       0,
		Password: "",
	})

	_, err := RedisClient.Ping(context.Background()).Result()

	if err != nil {
		log.Fatal("Error connecting to redis")
	}
}

func persistData() {
	curr := utils.ThisMinute()
	log.Println("Running the job")

	allKeys, err := RedisClient.Keys(ctx, "*").Result()

	if err != nil {
		return
	}

	// log.Printf("%v", allKeys)

	for _, timeStamp := range allKeys {
		if timeStamp == curr {
			continue
		}
		keyType, err := RedisClient.Type(ctx, timeStamp).Result()
		if err != nil || keyType != "zset" {
			continue
		}
		log.Println(keyType)
		data, err := RedisClient.ZRevRange(ctx, timeStamp, 0, 2).Result()
		if err != nil {
			return
		}

		fmt.Printf("%v", data)

		first, second, third := sql.NullString{
			String: "",
			Valid:  false,
		}, sql.NullString{
			String: "",
			Valid:  false,
		}, sql.NullString{
			String: "",
			Valid:  false,
		}

		if len(data) > 0 {
			first = sql.NullString{
				String: data[0],
				Valid:  data[0] != "",
			}
		}

		if len(data) > 1 {
			second = sql.NullString{
				String: data[1],
				Valid:  data[1] != "",
			}
		}
		if len(data) > 2 {
			third = sql.NullString{
				String: data[2],
				Valid:  data[2] != "",
			}
		}

		newWord, err := DbClient.InsertWord(ctx, database.InsertWordParams{
			ID:     timeStamp,
			First:  first,
			Second: second,
			Third:  third,
		})

		if err != nil {
			return
		}

		log.Printf("Yay word stored: %v \n", newWord)
		RedisClient.Del(ctx, timeStamp)
		log.Println("Yay timestamp cleared")
	}
}

func scheduleJobs() {
	s, err := gocron.NewScheduler()
	if err != nil {
		// try forever
		log.Print(err)
		scheduleJobs()
	}
	_, err = s.NewJob(gocron.CronJob("* * * * *", true), gocron.NewTask(persistData))
	if err != nil {
		log.Fatal("Error createing the job")
	}
	s.Start()
	log.Print("Scheduled")

}

func main() {
	godotenv.Load()
	port := os.Getenv("PORT")
	mbMap = utils.NewMessageBatchMap()
	wsServer := &webSocketServer{
		RWMutex:          &sync.RWMutex{},
		connections:      make(map[*websocket.Conn]bool),
		connectionsCount: 0,
	}

	if port == "" {
		log.Fatal("PORT not found")
	}

	initDb()
	initRedis()

	broadCastCh = make(chan string)
	go scheduleJobs()
	go wsServer.broadCastEverySecond()
	go func() {
		for {
			// Send a string to the channel every second
			broadCastCh <- fmt.Sprint(mbMap.Read(utils.ThisSecond()))
			time.Sleep(1 * time.Second)
			log.Println("done")
		}
	}()

	router := chi.NewRouter()

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*", "ws://*", "wss://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Content-Type", "Set-Cookie", "Cookie"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	srv := &http.Server{
		Handler: router,
		Addr:    ":" + port,
	}

	router.Use(cookieMiddleware)

	router.Get("/", handlerReadiness)
	router.Get("/connect", wsServer.webSocketHandler)

	log.Printf("Server starting on port %v", port)
	err := srv.ListenAndServe()

	if err != nil {
		log.Fatal(err)
	}

}
