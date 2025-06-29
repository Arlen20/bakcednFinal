package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/nats-io/nats.go"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client
var nc *nats.Conn // NATS connection

func main() {
	var err error
	mongoURI := "mongodb+srv://nurlybaynurbol:987412365nn@cluster0.436nq.mongodb.net/?retryWrites=true&w=majority"

	client, err = mongo.NewClient(options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Error creating MongoDB client:", err)
	}

	err = client.Connect(context.Background())
	if err != nil {
		log.Fatal("Error connecting to MongoDB:", err)
	}
	defer client.Disconnect(context.Background())

	fmt.Println("MongoDB connection established")

	// Connect to NATS server
	nc, err = nats.Connect(nats.DefaultURL)
	if err != nil {
		log.Fatal("Error connecting to NATS:", err)
	}
	defer nc.Close()

	fmt.Println("Connected to NATS server")

	// Subscribe to NATS subject for email notifications
	go subscribeToEmailNotifications()

	// HTTP Handlers
	http.HandleFunc("/users", getUsers)
	http.HandleFunc("/send-email", sendEmailHandler)

	// Enable CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Allow your frontend's origin
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(http.DefaultServeMux)
	fmt.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func getUsers(w http.ResponseWriter, r *http.Request) {
	// Function implementation remains unchanged
}

func sendEmailHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // Limit upload size to 10 MB
	if err != nil {
		http.Error(w, "Unable to parse form data", http.StatusBadRequest)
		return
	}

	to := r.FormValue("to")
	subject := r.FormValue("subject")
	body := r.FormValue("body")

	// Publish email details to NATS
	emailData := map[string]string{
		"to":      to,
		"subject": subject,
		"body":    body,
	}
	emailDataJSON, _ := json.Marshal(emailData)
	if err := nc.Publish("email.notifications", emailDataJSON); err != nil {
		log.Println("Error publishing to NATS:", err)
		http.Error(w, "Failed to send email notification", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Email notification sent successfully"))
}

func subscribeToEmailNotifications() {
	_, err := nc.Subscribe("email.notifications", func(msg *nats.Msg) {
		var emailData map[string]string
		if err := json.Unmarshal(msg.Data, &emailData); err != nil {
			log.Println("Error unmarshalling NATS message:", err)
			return
		}

		// Process the email data (e.g., send an email)
		log.Printf("Received email notification: %+v\n", emailData)
		sendEmail(emailData["to"], emailData["subject"], emailData["body"])
	})
	if err != nil {
		log.Println("Error subscribing to NATS subject:", err)
	}
}

func sendEmail(to, subject, body string) {
	// Placeholder function to send email
	log.Printf("Sending email to: %s, Subject: %s, Body: %s\n", to, subject, body)
}
