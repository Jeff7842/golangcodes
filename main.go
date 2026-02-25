package main

import (
	"log"
	"net/http"
	"os"

	"golang.codes/handlers"
)

func main() {
	// Static files (Monaco editor JS, CSS)
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Routes
	http.HandleFunc("/", handlers.HomeHandler)
	http.HandleFunc("/api/run", handlers.RunHandler)
	http.HandleFunc("/go/", handlers.ResourceHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
