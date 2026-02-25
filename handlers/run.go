package handlers

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

func RunHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	code := r.FormValue("code")
	if code == "" {
		sendResult(w, "Error: No code provided", true)
		return
	}

	// Create a temporary directory for the code
	tempDir, err := os.MkdirTemp("", "go-run-")
	if err != nil {
		sendResult(w, fmt.Sprintf("Internal Error: %v", err), true)
		return
	}
	defer os.RemoveAll(tempDir) // clean up

	filePath := filepath.Join(tempDir, "main.go")
	if err := os.WriteFile(filePath, []byte(code), 0644); err != nil {
		sendResult(w, fmt.Sprintf("Internal Error: %v", err), true)
		return
	}

	// Set a 5-second timeout for execution
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "run", filePath)

	// Capture output
	outPipe, err := cmd.StdoutPipe()
	if err != nil {
		sendResult(w, fmt.Sprintf("Internal Error: %v", err), true)
		return
	}
	errPipe, err := cmd.StderrPipe()
	if err != nil {
		sendResult(w, fmt.Sprintf("Internal Error: %v", err), true)
		return
	}

	if err := cmd.Start(); err != nil {
		sendResult(w, fmt.Sprintf("Failed to run code: %v", err), true)
		return
	}

	outBytes, _ := io.ReadAll(outPipe)
	errBytes, _ := io.ReadAll(errPipe)

	err = cmd.Wait()

	if ctx.Err() == context.DeadlineExceeded {
		sendResult(w, "Execution timed out (5s limit)", true)
		return
	}

	output := string(outBytes)
	if len(errBytes) > 0 {
		if len(output) > 0 {
			output += "\n"
		}
		output += string(errBytes)
	}

	isError := err != nil
	sendResult(w, output, isError)
}

func sendResult(w http.ResponseWriter, output string, isError bool) {
	w.Header().Set("Content-Type", "text/html")

	colorClass := "text-green-400"
	if isError {
		colorClass = "text-red-400"
	}

	if output == "" {
		output = "Program exited successfully with no output."
		colorClass = "text-gray-400"
	}

	html := fmt.Sprintf(`<pre class="whitespace-pre-wrap font-mono text-sm %s">%s</pre>`, colorClass, templateEscape(output))
	w.Write([]byte(html))
}

func templateEscape(s string) string {
	// Simple escape for HTML display
	// In a real app we'd use html/template, but this is a quick HTMX fragment
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	return s
}
