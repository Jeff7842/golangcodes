package handlers

import (
	"bytes"
	"html/template"
	"net/http"
	"os"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	tmpl, err := template.ParseFiles("templates/landing.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tmpl.Execute(w, nil)
}

func ResourcesPageHandler(w http.ResponseWriter, r *http.Request) {
	md, err := os.ReadFile("Go/Community Resources.md")
	if err != nil {
		http.Error(w, "Could not load resources", http.StatusInternalServerError)
		return
	}

	md_parser := goldmark.New(goldmark.WithExtensions(extension.Linkify))

	var buf bytes.Buffer
	if err = md_parser.Convert(md, &buf); err != nil {
		http.Error(w, "Could not render resources", http.StatusInternalServerError)
		return
	}

	tmpl, err := template.ParseFiles("templates/resources.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = tmpl.Execute(w, template.HTML(buf.String())); err != nil {
		http.Error(w, "Execute Error: "+err.Error(), http.StatusInternalServerError)
	}
}

func ResourceHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = tmpl.Execute(w, nil); err != nil {
		http.Error(w, "Execute Error: "+err.Error(), http.StatusInternalServerError)
	}
}
