# 🐹 Golang Codes — Learn Go Interactively

An open-source, interactive Go learning platform with a built-in code editor, gamification, and community-driven content.

![Go Version](https://img.shields.io/badge/Go-1.23-00ADD8?logo=go&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## ✨ Features

- **Interactive Monaco Code Editor** — Write, edit, and run Go code directly in the browser
- **Click-to-Edit Code Blocks** — Click any code example in a lesson to instantly load it into the editor
- **Live Code Execution** — Run Go code server-side with a secure sandboxed `go run` command
- **Gamification & XP System** — Earn XP for reading lessons and running code
- **Progress Tracking** — Track completed lessons, read counts, and coding progress via localStorage
- **Dark Mode** — Full dark/light theme toggle with persistent preference
- **Syntax Highlighting** — PrismJS-powered highlighting for all Go code examples
- **Community Contributions** — Edit any lesson directly on GitHub via the "Edit this page" button
- **Responsive Design** — Built with Tailwind CSS for a premium, mobile-friendly experience

---

## 🚀 Getting Started

### Prerequisites

- [Go 1.23+](https://go.dev/dl/)
- [Air](https://github.com/air-verse/air) (for hot-reloading during development)

### Installation

```bash
# Clone the repo
git clone https://github.com/hersi/golang.codes.git
cd golang.codes

# Install Air for hot-reloading
go install github.com/air-verse/air@v1.52.3

# Start the development server
make dev
```

The app will be available at **http://localhost:8080**.

### Production Build

```bash
go build -o server .
PORT=8080 ./server
```

### Docker

```bash
docker build -t golang-codes .
docker run -p 8080:8080 golang-codes
```

---

## 📁 Project Structure

```
golang.codes/
├── Go/                    # Markdown lesson files (the syllabus)
│   ├── Introduction.md
│   ├── Variables in Go.md
│   ├── Data Structures.md
│   └── ...
├── handlers/
│   ├── pages.go           # Route handlers for lessons & homepage
│   └── run.go             # Secure code execution endpoint
├── static/
│   ├── main.js            # App logic (editor, gamification, HTMX)
│   ├── storage.js         # Storage API abstraction layer
│   └── gopher.webp        # Gopher mascot
├── templates/
│   └── index.html         # Main HTML template
├── main.go                # Server entry point
├── Dockerfile             # Production Docker image
├── Makefile               # Dev commands
└── .air.toml              # Air hot-reload config
```

---

## 📝 Lesson Syllabus

The course covers Go from fundamentals to advanced topics:

1. Introduction
2. Variables in Go
3. Data Structures
4. Conditionals in Go
5. Loops
6. Functions
7. Slice
8. Maps
9. Pointers
10. Structs
11. Packages and Modules
12. Interfaces in Go
13. Errors
14. Go Symbols
15. Go Standard Library
16. Channels in Go
17. Mutexes in Go
18. Context Package
19. Generics in Go
20. Enums in Go
21. Understanding Allocations in Go
22. Design Patterns in Go
23. Go Best Lessons
24. Community Resources

---

## 🤝 Contributing

We welcome contributions! Whether it's fixing a typo, improving an explanation, or adding a new lesson — every contribution matters.

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

### Quick Contribution

1. Find a lesson page on the site
2. Click **"Edit this page on GitHub"** at the bottom
3. Make your changes to the Markdown file
4. Submit a Pull Request

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go `net/http` |
| Frontend | HTMX, Tailwind CSS |
| Code Editor | Monaco Editor |
| Syntax Highlighting | PrismJS |
| Markdown Rendering | Goldmark |
| Hot Reload | Air |
| Deployment | Docker / Railway |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## ⭐ Support

If you find this project useful, please give it a star! It helps others discover the project.

Built with ❤️ by the Go community.
