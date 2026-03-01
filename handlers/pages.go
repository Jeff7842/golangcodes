package handlers

import (
	"html/template"
	"net/http"
	"os"
	"strings"
)

func slugify(s string) string {
	return strings.ReplaceAll(strings.ToLower(s), " ", "-")
}

type Resource struct {
	Title        string
	Path         string
	Content      template.HTML
	QualityScore int
	TotalVotes   int
}

type PageData struct {
	Resources      []Resource
	ActiveResource *Resource
	PrevResource   *Resource
	NextResource   *Resource
}

func getResources() []Resource {
	var resources []Resource
	dir := "Go"

	entries, err := os.ReadDir(dir)
	if err != nil {
		return resources
	}

	entryMap := make(map[string]os.DirEntry)
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".md") {
			title := strings.TrimSuffix(entry.Name(), ".md")
			entryMap[title] = entry
		}
	}

	for title := range entryMap {
		score, votes := Store.GetScoreAndVotes(slugify(title))
		resources = append(resources, Resource{
			Title:        title,
			Path:         "/go/" + slugify(title),
			QualityScore: score,
			TotalVotes:   votes,
		})
	}

	return resources
}

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

	data := PageData{
		Resources: getResources(),
	}

	tmpl.Execute(w, data)
}

func ResourceHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resources := getResources()

	data := PageData{
		Resources: resources,
	}

	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, "Execute Error: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
