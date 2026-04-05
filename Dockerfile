# Use a full Go environment to build AND run the application
# We need the full Go image instead of a slim alpine runtime because our /api/run
# endpoint actively uses the `go run` command to compile user code securely on the fly!
FROM golang:1.24-alpine

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and directories (Go/, static/, templates/)
COPY . .

# Build the Go binary
RUN go build -o server main.go

# Railway will provide the PORT env var dynamically
ENV PORT=8080
EXPOSE 8080

# Run the compiled binary
CMD ["./server"]
