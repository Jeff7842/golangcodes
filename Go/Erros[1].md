![](https://www.notion.so/icons/aquarius_green.svg)

# Erros\[1\]

# Error Handling in Go: From Basics to Advanced

Error handling in Go follows explicit patterns that differ from exception-based approaches. Let's explore the complete error handling system in Go.

# Errors in Go: A Systems Engineer's Mental Model

Let's build a deep understanding of Go's error handling that goes beyond syntax and gets into the philosophy and practical engineering behind it.

## The Philosophy: Why Go Errors Are Simple By Design

**Metaphor**: Go's error handling is like a toolbox with just a hammer, screwdriver, and wrench - not a Swiss Army knife with 50 obscure tools. It's designed for clarity and explicit handling rather than magic.

Rob Pike's design principle: "Errors are just values" - this means:

*   No exceptions (unlike Java/Python)

*   No complex hierarchies (unlike Java's Exception classes)

*   No hidden control flow

**Why?** Because in systems programming:

1.  You need to see all possible code paths

2.  Errors are part of your normal program flow

3.  Recovery from serious errors is often impossible (if your database connection fails, you can't "retry" in many cases)

## The Mental Model: Three Layers of Understanding

1.  **Value Layer**: An error is just a value implementing `error` interface
    
    ```Go
    type error interface {
        Error() string
    }
    ```

2.  **Control Flow Layer**: Errors are handled immediately where they occur

3.  **Context Layer**: Errors carry stack information through decoration

## Common Pitfalls & How to Think About Them

### Pitfall 1: Ignoring Errors

```Go
file, _ := os.Open("config.json") // BAD!
```

**Systems Thinking**: This is like ignoring warning lights on your car's dashboard. It might work now, but you're building a time bomb.

### Pitfall 2: Over-general Error Handling

```Go
if err != nil {
    log.Fatal(err) // Nuclear option
}
```

**Better Approach**: Think like a traffic controller:

*   Some errors are stop signs (fatal)

*   Some are yield signs (retryable)

*   Some are just informational (can continue)

### Pitfall 3: Losing Context

```Go
if err != nil {
    return err // Where did this come from?
}
```

**Solution**: Wrap errors with context (Go 1.13+):

```Go
if err != nil {
    return fmt.Errorf("config load failed: %w", err)
}
```

## Real-World Patterns

### Pattern 1: Sentinel Errors

```Go
var ErrNotFound = errors.New("not found")

// Usage
if err == ErrNotFound {
    // Handle specific case
}
```

**Analogy**: These are like HTTP status codes - predefined markers for common conditions.

### Pattern 2: Error Types

```Go
type ConfigError struct {
    File string
    Line int
    Err  error
}

func (e *ConfigError) Error() string {
    return fmt.Sprintf("%s:%d: %v", e.File, e.Line, e.Err)
}
```

**When to Use**: When you need to carry structured error information up the call stack.

### Pattern 3: Temporary Errors

```Go
type temporary interface {
    Temporary() bool
}

if tempErr, ok := err.(temporary); ok && tempErr.Temporary() {
    time.Sleep(1 * time.Second)
    continue // retry
}
```

**Systems Thinking**: Like electrical systems with circuit breakers - some failures are transient.

## The Error Handling Cheat Sheet

### 1\. Basic Rules

*   Always handle errors immediately where they occur

*   Never use `_` to ignore errors

*   Add context when propagating errors (`%w` in Go 1.13+)

### 2\. Decision Tree

```Plain
Is the error...
├── Expected behavior? → Handle specifically
├── Unexpected but recoverable? → Log and retry/continue
└── Fatal? → Log and exit cleanly
```

### 3\. Composition Pattern

```Go
func DoSomething() error {
    if err := step1(); err != nil {
        return fmt.Errorf("step1 failed: %w", err)
    }
    if err := step2(); err != nil {
        return fmt.Errorf("step2 failed: %w", err)
    }
    return nil
}
```

### 4\. Inspection

```Go
// Unwrap
if errors.Is(err, ErrNotFound) { /*...*/ }

// Type check
var cfgErr *ConfigError
if errors.As(err, &cfgErr) { /*...*/ }
```

### 5\. Logging Best Practices

```Go
log.Printf("failed to load config: %v", err)               // Basic
log.Printf("failed to load config: %+v", err)              // With stack trace if available
slog.Error("failed to load config", "error", err, "file", filename) // Structured
```

## Advanced: Error Chaining Visualization

Think of error propagation like an onion:

```Plain
Top layer: "failed to process request"
  └─ "failed to load config: config.json"
     └─ "file read error"
        └─ "disk I/O timeout"
```

Each layer adds context while preserving the original information.

## Final Engineering Insight

Go's error handling is designed to make you think carefully about:

1.  **Visibility**: All error paths are explicit

2.  **Recoverability**: What can actually be recovered from?

3.  **Debuggability**: Can you trace the error's origin?

Remember: In systems programming, how you handle failures is often more important than how you handle success.

## Table of Contents

1.  [Basic Error Handling](Erros%5B1%5D%202091ccc344b1807993fce8ecd73bf262.html)

2.  [Creating Custom Errors](Erros%5B1%5D%202091ccc344b1807993fce8ecd73bf262.html)

3.  [Error Wrapping](Erros%5B1%5D%202091ccc344b1807993fce8ecd73bf262.html)

4.  [Error Inspection](Erros%5B1%5D%202091ccc344b1807993fce8ecd73bf262.html)

5.  [Sentinel Errors](Erros%5B1%5D%202091ccc344b1807993fce8ecd73bf262.html)

6.  [Error Types](Erros%5B1%5D%202091ccc344b1807993fce8ecd73bf262.html)

7.  [Panic and Recover](Erros%5B1%5D%202091ccc344b1807993fce8ecd73bf262.html)

8.  [Advanced Patterns](Erros%5B1%5D%202091ccc344b1807993fce8ecd73bf262.html)

9.  [Best Practices](Erros%5B1%5D%202091ccc344b1807993fce8ecd73bf262.html)

## Basic Error Handling

Go uses explicit error returns rather than exceptions:

```Go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

result, err := divide(10, 0)
if err != nil {
    log.Printf("Error: %v", err)
    // handle error
}
```

## Creating Custom Errors

### Simple Custom Errors

```Go
var ErrNotFound = errors.New("not found")

func findUser(id int) (*User, error) {
    if id < 1 {
        return nil, ErrNotFound
    }
    // ...
}
```

### Error with Context

```Go
type InputError struct {
    Field   string
    Message string
}

func (e *InputError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

func validateInput(input string) error {
    if len(input) < 5 {
        return &InputError{
            Field:   "input",
            Message: "must be at least 5 characters",
        }
    }
    return nil
}
```

## Error Wrapping

Go 1.13+ introduced error wrapping with `%w`:

```Go
func processFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return fmt.Errorf("failed to open file: %w", err)
    }
    defer f.Close()
    // ...
}
```

## Error Inspection

### Checking Error Types

```Go
if err := processFile("test.txt"); err != nil {
    var inputErr *InputError
    if errors.As(err, &inputErr) {
        fmt.Println("Input error:", inputErr.Field)
    }

    if errors.Is(err, os.ErrNotExist) {
        fmt.Println("File not found")
    }
}
```

### Unwrapping Errors

```Go
if err := processFile("test.txt"); err != nil {
    if unwrapped := errors.Unwrap(err); unwrapped != nil {
        fmt.Println("Original error:", unwrapped)
    }
}
```

## Sentinel Errors

Predefined errors for specific conditions:

```Go
var (
    ErrInvalidInput = errors.New("invalid input")
    ErrNotFound     = errors.New("not found")
    ErrTimeout      = errors.New("operation timed out")
)

func fetchData() error {
    return ErrTimeout
}

if err := fetchData(); errors.Is(err, ErrTimeout) {
    // handle timeout
}
```

## Error Types

More complex error structures:

```Go
type APIError struct {
    StatusCode int
    Message    string
    Details    map[string]interface{}
}

func (e *APIError) Error() string {
    return fmt.Sprintf("API error %d: %s", e.StatusCode, e.Message)
}

func callAPI() error {
    return &APIError{
        StatusCode: 404,
        Message:    "Resource not found",
        Details:    map[string]interface{}{"id": 123},
    }
}
```

## Panic and Recover

### Panic

```Go
func criticalOperation() {
    if someCriticalCondition {
        panic("critical failure occurred")
    }
}
```

### Recover

```Go
func safeOperation() (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered from panic: %v", r)
        }
    }()

    criticalOperation()
    return nil
}
```

## Advanced Patterns

### Error Chaining

```Go
func process() error {
    if err := step1(); err != nil {
        return fmt.Errorf("step1 failed: %w", err)
    }
    if err := step2(); err != nil {
        return fmt.Errorf("step2 failed: %w", err)
    }
    return nil
}
```

### Temporary Errors

```Go
type TemporaryError interface {
    Temporary() bool
}

type tempError struct {
    error
}

func (t *tempError) Temporary() bool { return true }

func RetryOperation() error {
    return &tempError{errors.New("temporary failure")}
}

if err := RetryOperation(); err != nil {
    var te TemporaryError
    if errors.As(err, &te) && te.Temporary() {
        // retry logic
    }
}
```

### Error Aggregation

```Go
type MultiError struct {
    Errors []error
}

func (m *MultiError) Error() string {
    var msgs []string
    for _, err := range m.Errors {
        msgs = append(msgs, err.Error())
    }
    return strings.Join(msgs, "; ")
}

func (m *MultiError) Add(err error) {
    if err != nil {
        m.Errors = append(m.Errors, err)
    }
}

func Validate(input string) error {
    var merr MultiError
    if len(input) < 5 {
        merr.Add(errors.New("too short"))
    }
    if !strings.ContainsAny(input, "!@#") {
        merr.Add(errors.New("missing special char"))
    }
    if len(merr.Errors) > 0 {
        return &merr
    }
    return nil
}
```

## Best Practices

1.  Always check errors explicitly

2.  Use `errors.Is` and `errors.As` for error inspection

3.  Wrap errors with context using `fmt.Errorf` with `%w`

4.  Define sentinel errors as variables (`var ErrSomething = errors.New(...)`)

5.  For complex errors, implement custom error types

6.  Document possible errors in function comments

7.  Use panic only for truly unrecoverable errors

8.  Consider error handling as part of your API design

9.  Keep error messages actionable and clear

10.  Use consistent error handling patterns across your codebase

## Complete Example

```Go
package main

import (
	"errors"
	"fmt"
	"log"
	"os"
	"time"
)

var (
	ErrFileNotFound   = errors.New("file not found")
	ErrInvalidFormat  = errors.New("invalid file format")
	ErrProcessTimeout = errors.New("processing timeout")
)

type FileError struct {
	Path   string
	Op     string
	Reason string
	Cause  error
}

func (e *FileError) Error() string {
	return fmt.Sprintf("%s %s: %s (cause: %v)", e.Op, e.Path, e.Reason, e.Cause)
}

func (e *FileError) Unwrap() error {
	return e.Cause
}

func processFile(path string) error {
	f, err := os.Open(path)
	if err != nil {
		return &FileError{
			Path:   path,
			Op:     "open",
			Reason: "failed to access file",
			Cause:  err,
		}
	}
	defer f.Close()

	// Simulate processing
	time.Sleep(2 * time.Second)

	// Simulate timeout
	return ErrProcessTimeout
}

func main() {
	err := processFile("missing.txt")
	if err != nil {
		switch {
		case errors.Is(err, ErrProcessTimeout):
			log.Println("Warning: processing took too long")
		default:
			var ferr *FileError
			if errors.As(err, &ferr) {
				log.Printf("File operation failed: %v", ferr)
				if os.IsNotExist(errors.Unwrap(ferr)) {
					log.Println("(The file doesn't exist)")
				}
			} else {
				log.Printf("Unexpected error: %v", err)
			}
		}
	}

	// Using panic/recover for critical sections
	func() {
		defer func() {
			if r := recover(); r != nil {
				log.Println("Recovered from panic:", r)
			}
		}()
		panic("something went terribly wrong")
	}()
}
```

Alright Yussuf, let's rip the band-aid off and go deep.

You're asking for a systems engineer's understanding of **errors in Go** — not just surface-level stuff, but the real architecture behind the idea. That means we’re not here to memorize `errors.New()` or throw around `fmt.Errorf` like confetti. We’re going to understand why Go _chose_ its error model — and how that should shape your design decisions like a scalpel, not a hammer.

* * *

## ⚙️ Mental Model: Errors in Go

### 🔧 Errors Are Values

> “In Go, errors are just values.”

This is _not_ just a slogan. It’s a declaration of Go's design philosophy: **explicit > implicit, control > magic**.

Errors in Go are not exceptions. They are part of the normal flow of your program — **like return values**. This means:

*   They're not disruptive (no panic unless catastrophic).

*   You _must_ acknowledge them, or the compiler will slap you.

*   You _decide_ what to do, explicitly — no hidden stack unwinding, no invisible propagation.

### 🧱 Metaphor: Errors as Post-Operation Reports

Imagine a manufacturing line. Every station (function) receives an item, processes it, and passes it to the next. Along with the item, each station attaches a **report card**.

*   ✅ If the item is fine: report card is empty (i.e., `err == nil`).

*   ❌ If something went wrong: the report card has the reason (`err != nil`).

This approach forces every downstream station to check the report card before proceeding. It prevents assumptions and enforces resilience.

### 🧠 Systems Thinking: Fail Fast, Fail Loud

In systems engineering, you **detect and handle failure early** to reduce blast radius. Go's error handling pushes you toward this mindset.

*   You can’t ignore errors.

*   You must handle or propagate.

*   You explicitly decide where and how to bubble up.

### 💣 Why Not Exceptions?

Go could have had exceptions. It didn’t. Why?

*   **Predictability:** Exceptions introduce hidden control flow. Go wanted to avoid “spooky action at a distance”.

*   **Simplicity:** You know at a glance what a function returns and how errors are handled.

*   **Performance:** No stack unwinding, no hidden allocations.

*   **Philosophy:** Go favors **mechanical sympathy** — close to the machine, not abstracted away.

* * *

## 🕳️ Common Pitfalls

### 1\. **Ignoring errors (**`**_ = someFunc()**`**)**

This is like ignoring the “check engine” light because the car still moves. You’re not clever — you’re reckless.

### 2\. **Returning raw errors from dependencies**

Never leak internal errors like database driver messages to your users. Wrap errors with context using `fmt.Errorf("fetching user: %w", err)`.

### 3\. **Swallowing context**

If you return `errors.New("not found")`, you lose traceability. Was it the DB? The cache? A config file? Always wrap with **contextual breadcrumbs**.

### 4\. **Overusing sentinel errors**

You don’t need a constant for every error. Use `errors.Is()` and `errors.As()` wisely for _meaningful_ error types.

* * *

## ✅ Best Practices (Burn These In)

1.  **Always return** `**error**` **as the last return value.**
    
    ```Go
    func DoThing() (Result, error)
    ```

2.  **Use** `**%w**` **for wrapping, not** `**%v**`**.**
    
    This allows `errors.Is()` and `errors.As()` to work.
    
    ```Go
    return fmt.Errorf("loading config: %w", err)
    ```

3.  **Use** `**errors.New**` **for static/simple errors.**

4.  **Define custom error types for structured errors.**
    
    Useful for switching logic, or returning structured JSON errors in APIs.
    
    ```Go
    type ErrRateLimit struct {
        Limit int
    }
    
    func (e ErrRateLimit) Error() string {
        return fmt.Sprintf("rate limit exceeded: %d", e.Limit)
    }
    ```

5.  **Don’t return nil interface with a non-nil error.**
    
    ```Go
    var r *Result = nil
    return r, fmt.Errorf("fail") // okay
    ```

6.  **Use** `**errors.Is**` **to compare wrapped errors.**
    
    ```Go
    if errors.Is(err, ErrNotFound) { ... }
    ```

7.  **Use** `**errors.As**` **to extract custom error types.**
    
    ```Go
    var e *MyCustomError
    if errors.As(err, &e) {
        fmt.Println(e.SpecificField)
    }
    ```

* * *

## 🔍 Real Use Cases

### 1\. **Config Loading Chain**

```Go
func LoadConfig() (*Config, error) {
    data, err := ioutil.ReadFile("/etc/myapp/config.json")
    if err != nil {
        return nil, fmt.Errorf("read config: %w", err)
    }

    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("unmarshal config: %w", err)
    }

    return &cfg, nil
}
```

This builds an **error breadcrumb trail** that is easy to debug.

* * *

### 2\. **Sentinel Errors**

```Go
var ErrNotFound = errors.New("not found")

func GetUser(id string) (*User, error) {
    user := db.FindUser(id)
    if user == nil {
        return nil, ErrNotFound
    }
    return user, nil
}
```

And in the caller:

```Go
user, err := GetUser("abc123")
if errors.Is(err, ErrNotFound) {
    log.Println("user not found")
}
```

* * *

### 3\. **Custom Error Type**

```Go
type ValidationError struct {
    Field string
    Msg   string
}

func (v ValidationError) Error() string {
    return fmt.Sprintf("invalid field %s: %s", v.Field, v.Msg)
}

func CreateUser(input Input) error {
    if input.Email == "" {
        return ValidationError{"email", "cannot be empty"}
    }
    return nil
}
```

And:

```Go
var v ValidationError
if errors.As(err, &v) {
    fmt.Println("Validation failed:", v.Field, v.Msg)
}
```

* * *

## 🧵 Cheat Sheet (Burn This Into Your Mind)

```Go
// Create basic errors
err := errors.New("something went wrong")

// Wrap with context
err := fmt.Errorf("loading config: %w", err)

// Compare with sentinel
if errors.Is(err, ErrSomething) { ... }

// Extract custom type
var e *MyError
if errors.As(err, &e) { ... }

// Custom error type
type MyError struct {
    Code int
}
func (e MyError) Error() string { return fmt.Sprintf("code %d", e.Code) }
```

> Error Design Rule of Thumb:
> 
> *   Don’t just return errors — **design** them.
> 
> *   Every layer of your app should leave **breadcrumbs**.
> 
> *   Your errors should answer: **What failed, where, and why.**

* * *

## 🔥 Final Thoughts

If you're building a backend, a CLI, or any system that grows, error handling is not the plumbing. It’s the _nervous system_ of your software.

Every function is either part of your recovery strategy or part of your crash path. Handle errors like a **surgeon, not a janitor**.

*   Don’t ignore.

*   Don’t blame.

*   Don't overabstract.

Treat each error like a **signal**. It tells you where your assumptions broke — and that's your most precious data as a system grows.

* * *

If you want to go even deeper, I’ll show you:

*   Error interfaces with stacks (`pkg/errors` and `xerrors`)

*   Logging best practices with errors

*   How to map Go errors to HTTP status codes for APIs

*   Error policies in microservices (retry? propagate? mask?)

You want to play at a higher level? Start treating error handling like strategy, not an afterthought.

What do you want next — logging, panic vs error strategy, or error orchestration in distributed systems?