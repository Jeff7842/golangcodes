![](https://www.notion.so/icons/battery_green.svg)

# Go standard library

# The `fmt` Package in Go

The `fmt` package in Go (short for "format") is one of the most frequently used packages in the standard library. It provides functions for formatted I/O operations, similar to C's printf and scanf.

## Key Features

### 1\. Formatted Output Functions

*   **Print()**: Writes to standard output without formatting

*   **Println()**: Writes to standard output with spaces between arguments and a newline

*   **Printf()**: Formats according to a format specifier and writes to standard output

*   **Sprint()**, **Sprintln()**, **Sprintf()**: Same as above but return the result as a string

*   **Fprint()**, **Fprintln()**, **Fprintf()**: Same as above but write to an io.Writer

### 2\. Formatted Input Functions

*   **Scan()**: Reads from standard input

*   **Scanln()**: Similar to Scan but stops scanning at a newline

*   **Scanf()**: Scans input according to a format specifier

*   **Sscan()**, **Sscanln()**, **Sscanf()**: Read from a string

*   **Fscan()**, **Fscanln()**, **Fscanf()**: Read from an io.Reader

### 3\. Format Specifiers

Common format verbs include:

*   `%v`: default format

*   `%+v`: includes struct field names

*   `%#v`: Go-syntax representation

*   `%T`: type of the value

*   `%t`: boolean

*   `%d`: integer

*   `%f`: floating point

*   `%s`: string

*   `%p`: pointer

*   `%x`: hexadecimal

## Examples

```Go
package main

import "fmt"

func main() {
    // Basic printing
    fmt.Print("Hello, ") // No newline
    fmt.Println("World!") // Adds newline

    // Formatted printing
    name := "Alice"
    age := 30
    fmt.Printf("%s is %d years old\\n", name, age)

    // String formatting
    s := fmt.Sprintf("Formatted string: %v", 42)
    fmt.Println(s)

    // Scanning input
    var input string
    fmt.Print("Enter something: ")
    fmt.Scanln(&input)
    fmt.Println("You entered:", input)
}
```

## Common Use Cases

1.  Printing debug information

2.  Formatting strings for output

3.  Parsing input from users or files

4.  Creating string representations of complex data structures

5.  Logging (often used in combination with log package)

The `fmt` package is essential for almost any Go program that needs to interact with users or display information. Its design follows Go's philosophy of simplicity while being powerful enough for most formatting needs.

# The `os` Package in Go

The `os` package in Go provides a platform-independent interface to operating system functionality, including file operations, process management, and environment variables. It's one of the most fundamental packages in Go's standard library for system interactions.

## Key Features

### 1\. File System Operations

*   **File handling**: Create, open, read, write, and close files

*   **File information**: Get file stats, check existence, permissions

*   **Directory operations**: Create, read, remove directories

*   **Path operations**: (Note: For more advanced path manipulation, use `path/filepath`)

### 2\. Process Management

*   **Process control**: Start, exit, and get process information

*   **Arguments**: Access command-line arguments

*   **Signals**: Handle OS signals

### 3\. Environment Variables

*   Get, set, and list environment variables

### 4\. Standard Streams

*   Access to stdin, stdout, and stderr

## Important Functions and Types

### File Operations

```Go
func Create(name string) (*File, error)
func Open(name string) (*File, error)
func OpenFile(name string, flag int, perm FileMode) (*File, error)
func (f *File) Read(b []byte) (n int, err error)
func (f *File) Write(b []byte) (n int, err error)
func (f *File) Close() error
func (f *File) Stat() (FileInfo, error)
```

### File Information

```Go
type FileInfo interface {
    Name() string       // Base name of the file
    Size() int64        // Length in bytes
    Mode() FileMode     // File mode bits
    ModTime() time.Time // Modification time
    IsDir() bool        // Abbreviation for Mode().IsDir()
    Sys() interface{}   // Underlying data source
}
```

### Directory Operations

```Go
func Mkdir(name string, perm FileMode) error
func MkdirAll(path string, perm FileMode) error
func Remove(name string) error
func RemoveAll(path string) error
func ReadDir(name string) ([]DirEntry, error)
```

### Process Management

```Go
func Exit(code int)
func Getpid() int
func Getppid() int
func Getuid() int
func Getgid() int
```

### Environment Variables

```Go
func Getenv(key string) string
func Setenv(key, value string) error
func Unsetenv(key string) error
func Clearenv()
func Environ() []string
```

### Standard Streams

```Go
var (
    Stdin  = NewFile(uintptr(syscall.Stdin), "/dev/stdin")
    Stdout = NewFile(uintptr(syscall.Stdout), "/dev/stdout")
    Stderr = NewFile(uintptr(syscall.Stderr), "/dev/stderr")
)
```

## Common Usage Examples

### 1\. File Operations

```Go
package main

import (
    "fmt"
    "os"
)

func main() {
    // Create a file
    file, err := os.Create("example.txt")
    if err != nil {
        panic(err)
    }
    defer file.Close()

    // Write to file
    file.WriteString("Hello, World!\\n")

    // Read file
    data, err := os.ReadFile("example.txt")
    if err != nil {
        panic(err)
    }
    fmt.Println(string(data))
}
```

### 2\. Environment Variables

```Go
package main

import (
    "fmt"
    "os"
)

func main() {
    // Set an environment variable
    os.Setenv("MY_VAR", "some value")

    // Get an environment variable
    value := os.Getenv("MY_VAR")
    fmt.Println("MY_VAR:", value)

    // List all environment variables
    for _, env := range os.Environ() {
        fmt.Println(env)
    }
}
```

### 3\. Command-Line Arguments

```Go
package main

import (
    "fmt"
    "os"
)

func main() {
    // os.Args[0] is the program name
    // os.Args[1:] holds the arguments
    if len(os.Args) > 1 {
        fmt.Println("Arguments:", os.Args[1:])
    } else {
        fmt.Println("No arguments provided")
    }
}
```

### 4\. Working with Directories

```Go
package main

import (
    "fmt"
    "os"
)

func main() {
    // Create a directory
    err := os.Mkdir("testdir", 0755)
    if err != nil {
        panic(err)
    }

    // List directory contents
    entries, err := os.ReadDir(".")
    if err != nil {
        panic(err)
    }

    fmt.Println("Directory contents:")
    for _, entry := range entries {
        fmt.Println(entry.Name())
    }

    // Clean up
    os.Remove("testdir")
}
```

## Important Notes

1.  **Error Handling**: Most `os` functions return errors that should be checked

2.  **Cross-Platform**: The package works across different operating systems

3.  **File Permissions**: Use Unix-style permission bits (like 0644) even on Windows

4.  **Path Separators**: For portable path handling, use `filepath` package instead of hardcoding `/` or `\\`

The `os` package is essential for any Go program that needs to interact with the operating system, whether it's for file I/O, process control, or environment configuration.

# The `io` Package in Go

The `io` package in Go provides fundamental interfaces and functions for I/O (input/output) operations. It defines basic interfaces like `Reader` and `Writer` that are used throughout Go's standard library and in third-party packages.

## Core Interfaces

### 1\. `Reader` Interface

```Go
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

*   Reads up to len(p) bytes into p

*   Returns number of bytes read and any error

*   Returns io.EOF at end of input

### 2\. `Writer` Interface

```Go
type Writer interface {
    Write(p []byte) (n int, err error)
}
```

*   Writes len(p) bytes from p

*   Returns number of bytes written and any error

### 3\. Other Important Interfaces

*   `Closer`: Interface with Close() method

*   `Seeker`: Interface with Seek() method

*   `ReadWriter`: Combines Reader and Writer

*   `ReadCloser`: Combines Reader and Closer

*   `WriteCloser`: Combines Writer and Closer

*   `ReadSeeker`: Combines Reader and Seeker

*   `WriteSeeker`: Combines Writer and Seeker

*   `ReadWriteSeeker`: Combines Reader, Writer and Seeker

## Key Functions

### 1\. Copy Functions

```Go
func Copy(dst Writer, src Reader) (written int64, err error)
func CopyN(dst Writer, src Reader, n int64) (written int64, err error)
func CopyBuffer(dst Writer, src Reader, buf []byte) (written int64, err error)
```

### 2\. Reading Functions

```Go
func ReadAll(r Reader) ([]byte, error)
func ReadAtLeast(r Reader, buf []byte, min int) (n int, err error)
func ReadFull(r Reader, buf []byte) (n int, err error)
```

### 3\. Writing Functions

```Go
func WriteString(w Writer, s string) (n int, err error)
```

### 4\. Utility Functions

```Go
func Pipe() (*PipeReader, *PipeWriter)
func MultiReader(readers ...Reader) Reader
func MultiWriter(writers ...Writer) Writer
func LimitReader(r Reader, n int64) Reader
func TeeReader(r Reader, w Writer) Reader
```

## Important Types

### 1\. `SectionReader`

Reads from a section of an underlying ReaderAt

### 2\. `PipeReader` and `PipeWriter`

Create an in-memory synchronous pipe

## Common Usage Examples

### 1\. Basic Reading and Writing

```Go
package main

import (
    "io"
    "os"
    "strings"
)

func main() {
    // Create a reader from a string
    reader := strings.NewReader("Hello, World!")

    // Copy from reader to stdout
    io.Copy(os.Stdout, reader)
}
```

### 2\. Using MultiWriter

```Go
package main

import (
    "io"
    "os"
)

func main() {
    file, _ := os.Create("output.txt")
    defer file.Close()

    // Write to both stdout and a file
    writer := io.MultiWriter(os.Stdout, file)
    io.WriteString(writer, "Hello to multiple writers!\\n")
}
```

### 3\. Limiting Reader

```Go
package main

import (
    "fmt"
    "io"
    "strings"
)

func main() {
    reader := strings.NewReader("This is a long string")
    limited := io.LimitReader(reader, 5)

    buf := make([]byte, 10)
    n, _ := limited.Read(buf)
    fmt.Println(string(buf[:n])) // "This "
}
```

### 4\. Using Pipe

```Go
package main

import (
    "fmt"
    "io"
)

func main() {
    r, w := io.Pipe()

    go func() {
        fmt.Fprint(w, "Hello through pipe!\\n")
        w.Close()
    }()

    io.Copy(os.Stdout, r)
}
```

## Key Concepts

1.  **Composition**: Many interfaces are composed of the basic Reader and Writer interfaces

2.  **Flexibility**: Works with any type that implements the interfaces (files, network connections, buffers, etc.)

3.  **Efficiency**: Many functions work with byte slices to minimize allocations

4.  **Error Handling**: Consistent error handling patterns (io.EOF for end of input)

The `io` package is fundamental to Go's I/O operations and its interfaces are implemented by many other packages in the standard library including `os`, `net`, `bytes`, and `strings`.

# The `bufio` Package in Go

The `bufio` package in Go implements buffered I/O, wrapping `io.Reader` and `io.Writer` objects to provide more efficient reading and writing with buffering and additional helper methods.

## Key Features

### 1\. Buffered Reading

*   Reduces system calls by reading larger chunks

*   Provides line-by-line reading capabilities

*   Offers methods for peeking ahead without consuming input

### 2\. Buffered Writing

*   Reduces system calls by batching writes

*   Provides methods for writing strings and bytes efficiently

### 3\. Scanner

*   High-level interface for reading data line-by-line or by words

*   Customizable split functions for different parsing needs

## Core Types

### 1\. `Reader`

```Go
type Reader struct {
    // contains filtered or unexported fields
}
```

Buffered reader with methods like:

*   `Read()`

*   `ReadByte()`

*   `ReadLine()`

*   `ReadString()`

*   `Peek()`

### 2\. `Writer`

```Go
type Writer struct {
    // contains filtered or unexported fields
}
```

Buffered writer with methods like:

*   `Write()`

*   `WriteByte()`

*   `WriteString()`

*   `Flush()`

### 3\. `Scanner`

```Go
type Scanner struct {
    // contains filtered or unexported fields
}
```

Flexible scanner with methods:

*   `Scan()`

*   `Text()`

*   `Bytes()`

*   `Split()` (to customize tokenization)

## Common Usage Examples

### 1\. Buffered Reading

```Go
package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    file, err := os.Open("file.txt")
    if err != nil {
        panic(err)
    }
    defer file.Close()

    reader := bufio.NewReader(file)
    for {
        line, err := reader.ReadString('\\n')
        if err != nil {
            break
        }
        fmt.Print(line)
    }
}
```

### 2\. Buffered Writing

```Go
package main

import (
    "bufio"
    "os"
)

func main() {
    file, err := os.Create("output.txt")
    if err != nil {
        panic(err)
    }
    defer file.Close()

    writer := bufio.NewWriter(file)
    writer.WriteString("Hello, ")
    writer.WriteString("World!\\n")
    writer.Flush() // Don't forget to flush!
}
```

### 3\. Using Scanner

```Go
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

func main() {
    const input = "hello world\\nhow are you?\\nanother line"
    scanner := bufio.NewScanner(strings.NewReader(input))

    // Read line by line
    for scanner.Scan() {
        fmt.Println(scanner.Text())
    }

    // Alternative: Split by words
    scanner = bufio.NewScanner(strings.NewReader(input))
    scanner.Split(bufio.ScanWords)
    for scanner.Scan() {
        fmt.Println(scanner.Text())
    }
}
```

### 4\. Custom Scanner Split Function

```Go
package main

import (
    "bufio"
    "bytes"
    "fmt"
)

func main() {
    const input = "123,456,789"
    scanner := bufio.NewScanner(bytes.NewReader([]byte(input)))

    // Split by comma
    splitByComma := func(data []byte, atEOF bool) (advance int, token []byte, err error) {
        if atEOF && len(data) == 0 {
            return 0, nil, nil
        }
        if i := bytes.IndexByte(data, ','); i >= 0 {
            return i + 1, data[0:i], nil
        }
        if atEOF {
            return len(data), data, nil
        }
        return 0, nil, nil
    }

    scanner.Split(splitByComma)
    for scanner.Scan() {
        fmt.Println(scanner.Text())
    }
}
```

## Performance Considerations

1.  **Buffer Size**: Default buffer size is 4096 bytes. Can be customized:
    
    ```Go
    reader := bufio.NewReaderSize(file, 16*1024) // 16KB buffer
    ```

2.  **Flush**: For writers, remember to call `Flush()` to ensure all data is written

3.  **Scanner Limits**: Scanner has a default token size limit (64K). Can be changed:
    
    ```Go
    scanner.Buffer(make([]byte, 1024), 10*1024*1024) // 10MB max token size
    ```

## When to Use bufio

1.  When reading input line by line (especially useful for text processing)

2.  When performing many small reads/writes (buffering improves performance)

3.  When you need peek-ahead functionality

4.  When working with interactive console input

The `bufio` package provides a good balance between convenience and performance, making it one of the most frequently used packages for I/O operations in Go.

# The `bytes` Package in Go

The `bytes` package in Go provides functions for manipulating byte slices (`[]byte`), similar to how the `strings` package works with strings. It's particularly useful for working with raw binary data or when you need mutable sequences of bytes.

## Key Features

### 1\. Core Functions

*   **Comparison**: Compare byte slices

*   **Searching**: Find bytes, sub-slices, or runes

*   **Manipulation**: Join, split, repeat, replace, trim, etc.

*   **Conversion**: To/from strings and runes

*   **Buffers**: Mutable growable byte buffers

### 2\. Important Types

### `Buffer` - A growable byte buffer

```Go
type Buffer struct {
    // contains filtered or unexported fields
}
```

Methods include:

*   `Write()`, `WriteByte()`, `WriteString()`

*   `Read()`, `ReadByte()`, `ReadBytes()`

*   `Grow()`, `Len()`, `Cap()`, `Reset()`

### `Reader` - Implements `io.Reader`, `io.ReaderAt`, etc.

```Go
type Reader struct {
    // contains filtered or unexported fields
}
```

## Common Operations

### 1\. Basic Manipulation

```Go
package main

import (
    "bytes"
    "fmt"
)

func main() {
    // Create and compare
    a := []byte("hello")
    b := []byte("world")
    fmt.Println(bytes.Equal(a, b)) // false

    // Contains check
    fmt.Println(bytes.Contains([]byte("hello world"), []byte("hello"))) // true

    // ToUpper/ToLower
    fmt.Println(string(bytes.ToUpper([]byte("Hello")))) // "HELLO"

    // Trim operations
    fmt.Println(string(bytes.Trim([]byte("!!hello!!"), "!"))) // "hello"
}
```

### 2\. Using Buffer

```Go
package main

import (
    "bytes"
    "fmt"
)

func main() {
    var buf bytes.Buffer

    // Write to buffer
    buf.Write([]byte("Hello"))
    buf.WriteByte(' ')
    buf.WriteString("World!")

    // Read from buffer
    fmt.Println(buf.String()) // "Hello World!"

    // Reset and reuse
    buf.Reset()
    buf.WriteString("New content")
    fmt.Println(buf.String()) // "New content"
}
```

### 3\. Splitting and Joining

```Go
package main

import (
    "bytes"
    "fmt"
)

func main() {
    // Splitting
    parts := bytes.Split([]byte("a,b,c"), []byte(","))
    for _, p := range parts {
        fmt.Println(string(p)) // a, b, c
    }

    // Joining
    joined := bytes.Join([][]byte{[]byte("foo"), []byte("bar")}, []byte("-"))
    fmt.Println(string(joined)) // "foo-bar"
}
```

### 4\. Reader Example

```Go
package main

import (
    "bytes"
    "fmt"
    "io"
)

func main() {
    data := []byte("Hello Reader!")
    r := bytes.NewReader(data)

    // Read 5 bytes
    b := make([]byte, 5)
    n, _ := r.Read(b)
    fmt.Printf("%d bytes: %q\\n", n, b[:n]) // 5 bytes: "Hello"

    // Read remaining bytes
    rest, _ := io.ReadAll(r)
    fmt.Printf("%q\\n", rest) // " Reader!"
}
```

## Performance Considerations

1.  **Reuse buffers** when possible to reduce allocations

2.  **Preallocate space** with `Buffer.Grow()` when you know the expected size

3.  **Consider alternatives**:
    
    *   `strings` package for string operations
    
    *   `bytearray` for very specific use cases
    
    *   `io` interfaces for streaming data

## Common Use Cases

1.  Building strings efficiently (alternative to `fmt.Sprintf`)

2.  Parsing binary data formats

3.  Implementing protocol encoders/decoders

4.  Processing text when you need mutable operations

5.  Working with I/O operations that use byte slices

The `bytes` package is particularly valuable when:

*   You need mutable sequences of bytes

*   Performance is critical (avokes string allocations)

*   Working with binary data

*   Implementing custom I/O operations

Example of efficient string building:

```Go
func buildString(parts ...string) string {
    var buf bytes.Buffer
    for _, p := range parts {
        buf.WriteString(p)
    }
    return buf.String()
}
```

The package works seamlessly with other I/O packages like `io`, `bufio`, and `os`, making it a fundamental part of Go's I/O ecosystem.

# The `strings` Package in Go

The `strings` package in Go provides functions for manipulating UTF-8 encoded strings. It's one of the most frequently used packages in Go's standard library for string processing.

## Key Features

### 1\. Basic String Operations

*   **Comparison**: Compare strings

*   **Searching**: Find substrings, characters

*   **Manipulation**: Replace, trim, pad, case conversion

*   **Splitting/Joining**: Split strings by delimiters

### 2\. Important Functions

### Comparison Functions

```Go
func Compare(a, b string) int
func EqualFold(s, t string) bool  // Case-insensitive comparison
```

### Search Functions

```Go
func Contains(s, substr string) bool
func Count(s, substr string) int
func HasPrefix(s, prefix string) bool
func HasSuffix(s, suffix string) bool
func Index(s, substr string) int
func LastIndex(s, substr string) int
```

### Manipulation Functions

```Go
func Replace(s, old, new string, n int) string
func ToLower(s string) string
func ToUpper(s string) string
func Trim(s, cutset string) string
func TrimSpace(s string) string
```

### Splitting/Joining

```Go
func Split(s, sep string) []string
func SplitAfter(s, sep string) []string
func Join(elems []string, sep string) string
```

### 3\. Special Types

*   `Builder`: Efficient string building (Go 1.10+)

*   `Reader`: Implements `io.Reader` interface for strings

## Common Usage Examples

### 1\. Basic String Operations

```Go
package main

import (
	"fmt"
	"strings"
)

func main() {
	// Comparison
	fmt.Println(strings.Compare("apple", "banana")) // -1 (a < b)
	fmt.Println(strings.EqualFold("Go", "go"))      // true

	// Searching
	fmt.Println(strings.Contains("hello world", "hello")) // true
	fmt.Println(strings.Index("chicken", "ken"))          // 4

	// Manipulation
	fmt.Println(strings.ToUpper("Hello"))                 // "HELLO"
	fmt.Println(strings.Trim("!!hello!!", "!"))           // "hello"
	fmt.Println(strings.Replace("oink oink oink", "k", "ky", 2))
	// "oinky oinky oink"
}
```

### 2\. Splitting and Joining

```Go
package main

import (
	"fmt"
	"strings"
)

func main() {
	// Splitting
	fmt.Printf("%q\\n", strings.Split("a,b,c", ",")) // ["a" "b" "c"]
	fmt.Printf("%q\\n", strings.SplitAfter("a,b,c", ",")) // ["a," "b," "c"]

	// Joining
	s := []string{"foo", "bar", "baz"}
	fmt.Println(strings.Join(s, ", ")) // "foo, bar, baz"
}
```

### 3\. Using Builder (Efficient String Building)

```Go
package main

import (
	"fmt"
	"strings"
)

func main() {
	var b strings.Builder

	b.WriteString("Hello")
	b.WriteByte(' ')
	b.WriteString("World!")

	fmt.Println(b.String()) // "Hello World!"

	// Reset and reuse
	b.Reset()
	b.WriteString("New content")
	fmt.Println(b.String()) // "New content"
}
```

### 4\. Using Reader

```Go
package main

import (
	"fmt"
	"io"
	"strings"
)

func main() {
	r := strings.NewReader("Hello Reader!")

	b := make([]byte, 5)
	n, _ := r.Read(b)
	fmt.Printf("%d bytes: %q\\n", n, b[:n]) // 5 bytes: "Hello"

	// Read remaining bytes
	rest, _ := io.ReadAll(r)
	fmt.Printf("%q\\n", rest) // " Reader!"
}
```

## Advanced Usage

### 1\. String Replacer

```Go
package main

import (
	"fmt"
	"strings"
)

func main() {
	replacer := strings.NewReplacer(
		"<", "&lt;",
		">", "&gt;",
	)
	fmt.Println(replacer.Replace("This is <b>HTML</b>!"))
	// "This is &lt;b&gt;HTML&lt;/b&gt;!"
}
```

### 2\. Custom Split Functions

```Go
package main

import (
	"fmt"
	"strings"
)

func main() {
	// Split by multiple whitespace
	f := func(c rune) bool {
		return c == ' ' || c == '\\t'
	}
	fmt.Printf("%q\\n", strings.FieldsFunc("foo\\tbar  baz", f))
	// ["foo" "bar" "baz"]
}
```

## Performance Considerations

1.  **Use** `**Builder**` for efficient string concatenation (better than `+` operator for multiple concatenations)

2.  **Prefer** `**Contains**` **over** `**Index**` when you only need to check existence

3.  **Reuse** `**Replacer**` objects when doing multiple replacements

4.  **Consider** `**bytes**` **package** if you're working with raw bytes that don't need to be strings

## Common Use Cases

1.  Text processing and parsing

2.  String validation and sanitization

3.  Building file paths and URLs

4.  Formatting output strings

5.  Implementing text-based protocols

6.  Template processing (often used with `text/template` or `html/template`)

The `strings` package is essential for virtually any Go program that needs to work with text data, providing both convenience and performance for common string operations.

# The `strconv` Package in Go

The `strconv` package in Go provides functions for converting between basic data types and their string representations. It's essential when you need to parse strings into numbers or other types, or format values as strings.

## Key Features

### 1\. String Conversion Functions

*   **Numeric conversions**: Parse and format numbers

*   **Boolean conversions**: Parse and format boolean values

*   **Quote functions**: Handle string escaping and quoting

*   **Append functions**: Efficiently build strings with conversions

### 2\. Core Functions

### Numeric Conversions

```Go
// String to number
func Atoi(s string) (int, error)        // Parse int (base 10)
func ParseInt(s string, base int, bitSize int) (i int64, err error)
func ParseUint(s string, base int, bitSize int) (uint64, error)
func ParseFloat(s string, bitSize int) (float64, error)

// Number to string
func Itoa(i int) string                 // Format int (base 10)
func FormatInt(i int64, base int) string
func FormatUint(i uint64, base int) string
func FormatFloat(f float64, fmt byte, prec, bitSize int) string
```

### Boolean Conversions

```Go
func ParseBool(str string) (bool, error)
func FormatBool(b bool) string
```

### Quoting Functions

```Go
func Quote(s string) string             // Add quotes and escape special chars
func Unquote(s string) (string, error)  // Remove quotes and unescape
func QuoteToASCII(s string) string      // Quote with ASCII-only escapes
```

### Append Functions (Efficient string building)

```Go
func AppendInt(dst []byte, i int64, base int) []byte
func AppendFloat(dst []byte, f float64, fmt byte, prec, bitSize int) []byte
func AppendBool(dst []byte, b bool) []byte
func AppendQuote(dst []byte, s string) []byte
```

## Common Usage Examples

### 1\. Basic Number Conversions

```Go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// String to int
	i, err := strconv.Atoi("42")
	if err != nil {
		panic(err)
	}
	fmt.Println(i) // 42

	// Int to string
	s := strconv.Itoa(123)
	fmt.Println(s) // "123"

	// Parse float
	f, err := strconv.ParseFloat("3.1415", 64)
	if err != nil {
		panic(err)
	}
	fmt.Println(f) // 3.1415
}
```

### 2\. Boolean Conversions

```Go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// String to bool
	b, err := strconv.ParseBool("true")
	if err != nil {
		panic(err)
	}
	fmt.Println(b) // true

	// Bool to string
	s := strconv.FormatBool(false)
	fmt.Println(s) // "false"
}
```

### 3\. Quoting Strings

```Go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// Quote a string
	q := strconv.Quote("Hello, 世界")
	fmt.Println(q) // "Hello, 世界"

	// Unquote a string
	unquoted, err := strconv.Unquote(`"Hello, \\u4e16\\u754c"`)
	if err != nil {
		panic(err)
	}
	fmt.Println(unquoted) // Hello, 世界
}
```

### 4\. Efficient String Building with Append

```Go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// Start with a byte slice
	buf := make([]byte, 0, 32)

	// Append various values
	buf = strconv.AppendBool(buf, true)
	buf = append(buf, ' ')
	buf = strconv.AppendInt(buf, 42, 10)
	buf = append(buf, ' ')
	buf = strconv.AppendFloat(buf, 3.1415, 'f', 2, 64)
	buf = append(buf, ' ')
	buf = strconv.AppendQuote(buf, "go")

	fmt.Println(string(buf)) // "true 42 3.14 \\"go\\""
}
```

### 5\. Advanced Number Parsing

```Go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// Parse hex number
	num, err := strconv.ParseInt("FF", 16, 64)
	if err != nil {
		panic(err)
	}
	fmt.Println(num) // 255

	// Format with different bases
	fmt.Println(strconv.FormatInt(255, 2))  // "11111111"
	fmt.Println(strconv.FormatInt(255, 8))  // "377"
	fmt.Println(strconv.FormatInt(255, 16)) // "ff"
}
```

## Performance Considerations

1.  **Use Append functions** when building strings in performance-critical code

2.  **Reuse buffers** when doing multiple conversions

3.  **Specify bit sizes** carefully when parsing numbers to avoid overflow

4.  **Handle errors** from parsing functions to avoid runtime panics

## Common Use Cases

1.  Parsing configuration values from strings

2.  Formatting numbers for display

3.  Building JSON or other text formats manually

4.  Converting user input to typed values

5.  Implementing serialization/deserialization

6.  Working with environment variables (which are strings)

The `strconv` package is particularly useful when:

*   You need strict control over number formatting

*   Performance is important (avoiding `fmt` package overhead)

*   You need to handle different numeric bases

*   You're working with quoted strings and need proper escaping

Example of efficient number formatting:

```Go
func formatID(id int64) string {
	buf := make([]byte, 0, 16)
	buf = append(buf, "ID:"...)
	buf = strconv.AppendInt(buf, id, 10)
	return string(buf)
}
```

The package works well with other I/O and string manipulation packages like `strings`, `bytes`, and `fmt`, providing lower-level conversion functionality than `fmt` but with better performance in many cases.

# The `unicode` Package in Go

The `unicode` package in Go provides functions and data for testing Unicode code point properties. It's essential for working with Unicode characters (runes) in Go programs.

## Key Features

### 1\. Character Classification

*   Functions to check Unicode categories (letters, numbers, symbols, etc.)

*   Case detection and conversion

*   Script and language detection

### 2\. Core Functions and Types

### Character Classification

```Go
func IsDigit(r rune) bool
func IsLetter(r rune) bool
func IsLower(r rune) bool
func IsUpper(r rune) bool
func IsSpace(r rune) bool
func IsGraphic(r rune) bool
func IsControl(r rune) bool
func IsPunct(r rune) bool
```

### Case Conversion

```Go
func ToLower(r rune) rune
func ToUpper(r rune) rune
func ToTitle(r rune) rune
```

### Range Tables

```Go
var (
    Letter    = _L // All letters
    Digit     = _Nd // All digits
    Space     = _Z // All whitespace
    // ... and many more
)
```

## Common Usage Examples

### 1\. Basic Character Checks

```Go
package main

import (
	"fmt"
	"unicode"
)

func main() {
	// Check character types
	fmt.Println(unicode.IsDigit('9'))  // true
	fmt.Println(unicode.IsLetter('A')) // true
	fmt.Println(unicode.IsSpace(' '))   // true
	fmt.Println(unicode.IsPunct('!'))  // true

	// Case checking
	fmt.Println(unicode.IsLower('a'))  // true
	fmt.Println(unicode.IsUpper('A'))  // true
}
```

### 2\. Case Conversion

```Go
package main

import (
	"fmt"
	"unicode"
)

func main() {
	// Convert cases
	fmt.Printf("%c\\n", unicode.ToLower('A')) // 'a'
	fmt.Printf("%c\\n", unicode.ToUpper('a')) // 'A'
	fmt.Printf("%c\\n", unicode.ToTitle('ǳ')) // 'ǲ' (title case differs for some letters)
}
```

### 3\. Using Range Tables

```Go
package main

import (
	"fmt"
	"unicode"
)

func main() {
	// Check if a rune is in a specific range table
	r := '世'
	if unicode.Is(unicode.Han, r) {
		fmt.Printf("%c is a Han character\\n", r)
	}
}
```

### 4\. Custom Character Validation

```Go
package main

import (
	"fmt"
	"unicode"
)

func isValidIdentifier(r rune) bool {
	return unicode.IsLetter(r) || r == '_'
}

func main() {
	fmt.Println(isValidIdentifier('a'))  // true
	fmt.Println(isValidIdentifier('_'))  // true
	fmt.Println(isValidIdentifier('1'))  // false
}
```

## Advanced Usage

### 1\. Working with Unicode Scripts

```Go
package main

import (
	"fmt"
	"unicode"
)

func main() {
	// Check if a character belongs to a specific script
	fmt.Println(unicode.Is(unicode.Greek, 'α')) // true
	fmt.Println(unicode.Is(unicode.Arabic, 'ا')) // true
}
```

### 2\. Simple Unicode Normalization

```Go
package main

import (
	"fmt"
	"unicode"
)

func toFold(r rune) rune {
	if unicode.IsSimpleFold(r) {
		return unicode.ToLower(r)
	}
	return r
}

func main() {
	fmt.Printf("%c\\n", toFold('A')) // 'a'
	fmt.Printf("%c\\n", toFold('Ω')) // 'ω'
}
```

## Performance Considerations

1.  **Range tables** provide efficient lookup for character properties

2.  **Simple functions** like `IsDigit` are optimized for common cases

3.  **Consider caching** results when checking many runes with complex conditions

## Common Use Cases

1.  Validating user input (usernames, passwords, etc.)

2.  Implementing lexical analyzers and parsers

3.  Text processing and normalization

4.  Internationalization (i18n) support

5.  Case-insensitive string comparisons

6.  Text filtering and sanitization

The `unicode` package is particularly useful when:

*   You need to handle international text properly

*   You're working with text processing at the character level

*   You need to implement custom text validation rules

*   You're dealing with case conversion beyond ASCII

Example of password validation:

```Go
func isStrongPassword(s string) bool {
	var hasUpper, hasLower, hasNumber, hasSpecial bool
	for _, r := range s {
		switch {
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsLower(r):
			hasLower = true
		case unicode.IsDigit(r):
			hasNumber = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSpecial = true
		}
	}
	return hasUpper && hasLower && hasNumber && hasSpecial
}
```

The package works closely with the `strings` and `bytes` packages, providing the low-level Unicode character operations that those packages use internally for their operations.

# The `errors` Package in Go

The `errors` package in Go provides simple error handling primitives. It's one of the most fundamental packages in Go's standard library for creating and manipulating errors.

## Key Features

### 1\. Error Creation

*   Create simple error values with messages

*   Wrap errors with additional context (Go 1.13+)

### 2\. Error Inspection

*   Check for specific errors

*   Unwrap nested errors (Go 1.13+)

### 3\. Core Functions

```Go
// Basic error creation
func New(text string) error

// Error wrapping and inspection (Go 1.13+)
func Unwrap(err error) error
func Is(err, target error) bool
func As(err error, target interface{}) bool
```

## Common Usage Examples

### 1\. Basic Error Creation

```Go
package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

func main() {
	err := process()
	if err != nil {
		fmt.Println(err) // "not found"
	}
}

func process() error {
	return ErrNotFound
}
```

### 2\. Error Wrapping (Go 1.13+)

```Go
package main

import (
	"errors"
	"fmt"
)

var ErrDBConnection = errors.New("database connection failed")

func main() {
	err := connectDB()
	if errors.Is(err, ErrDBConnection) {
		fmt.Println("Failed to connect to database:", err)
	}
}

func connectDB() error {
	// Simulate an operation that fails
	opErr := errors.New("connection timeout")
	return fmt.Errorf("%w: %v", ErrDBConnection, opErr)
}
```

### 3\. Error Inspection

```Go
package main

import (
	"errors"
	"fmt"
	"os"
)

func main() {
	_, err := os.Open("nonexistent.txt")

	// Check if error is of specific type
	if errors.Is(err, os.ErrNotExist) {
		fmt.Println("File does not exist")
	}

	// Get the underlying error
	var pathError *os.PathError
	if errors.As(err, &pathError) {
		fmt.Printf("Path error: %s, operation: %s\\n",
			pathError.Path, pathError.Op)
	}
}
```

### 4\. Custom Error Types

```Go
package main

import (
	"errors"
	"fmt"
)

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

func main() {
	err := validate("")

	var valErr *ValidationError
	if errors.As(err, &valErr) {
		fmt.Println("Validation failed on field:", valErr.Field)
	}
}

func validate(input string) error {
	if input == "" {
		return &ValidationError{
			Field:   "input",
			Message: "cannot be empty",
		}
	}
	return nil
}
```

## Advanced Usage

### 1\. Error Wrapping Chain

```Go
package main

import (
	"errors"
	"fmt"
)

func main() {
	err := layer1()
	fmt.Println(err) // "layer3: layer2: layer1: root error"

	// Unwrap the entire chain
	current := err
	for current != nil {
		fmt.Println(current)
		current = errors.Unwrap(current)
	}
}

func layer1() error {
	return fmt.Errorf("layer1: %w", layer2())
}

func layer2() error {
	return fmt.Errorf("layer2: %w", layer3())
}

func layer3() error {
	return errors.New("root error")
}
```

### 2\. Multiple Error Types

```Go
package main

import (
	"errors"
	"fmt"
)

var (
	ErrNetwork = errors.New("network error")
	ErrDB      = errors.New("database error")
)

func main() {
	err := processData()

	switch {
	case errors.Is(err, ErrNetwork):
		fmt.Println("Handle network error")
	case errors.Is(err, ErrDB):
		fmt.Println("Handle database error")
	default:
		fmt.Println("Unknown error:", err)
	}
}

func processData() error {
	return fmt.Errorf("%w: connection timeout", ErrNetwork)
}
```

## Best Practices

1.  **Use** `**errors.New**` for simple static errors

2.  **Use custom error types** when you need additional context

3.  **Wrap errors** with `fmt.Errorf` and `%w` to preserve the error chain

4.  **Check errors with** `**errors.Is**` for sentinel errors

5.  **Use** `**errors.As**` for type assertions on custom errors

6.  **Document expected errors** in your function signatures

## Common Use Cases

1.  Creating sentinel errors (predefined error values)

2.  Adding context to errors while propagating them

3.  Handling specific error types differently

4.  Implementing domain-specific error hierarchies

5.  Writing robust error handling code

The `errors` package is particularly useful when:

*   You need to define expected error conditions

*   You want to provide additional context with errors

*   You need to handle different error types differently

*   You're working with error chains from wrapped errors

Example of good error handling:

```Go
func ReadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("parse config: %w", err)
	}

	return &cfg, nil
}
```

The package works closely with the `fmt` package for error wrapping and provides the foundation for Go's error handling patterns

# The `log` Package in Go

The `log` package in Go provides simple logging utilities for Go programs. It's part of the standard library and offers basic but flexible logging capabilities.

## Key Features

### 1\. Basic Logging

*   Print messages with different severity levels

*   Add prefixes like timestamps automatically

*   Configure output destination

### 2\. Core Functions

```Go
// Basic logging functions
func Print(v ...interface{})
func Printf(format string, v ...interface{})
func Println(v ...interface{})

// Fatal functions (log and call os.Exit(1))
func Fatal(v ...interface{})
func Fatalf(format string, v ...interface{})
func Fatalln(v ...interface{})

// Panic functions (log and call panic())
func Panic(v ...interface{})
func Panicf(format string, v ...interface{})
func Panicln(v ...interface{})
```

### 3\. Logger Configuration

```Go
// Create custom logger
func New(out io.Writer, prefix string, flag int) *Logger

// Set output destination
func (l *Logger) SetOutput(w io.Writer)

// Set prefix
func (l *Logger) SetPrefix(prefix string)

// Set flags
func (l *Logger) SetFlags(flag int)
```

## Common Usage Examples

### 1\. Basic Logging

```Go
package main

import "log"

func main() {
	log.Print("This is a log message")
	log.Printf("Formatted %s", "message")
	log.Println("Message with newline")

	// Fatal logs and exits
	// log.Fatal("Fatal error occurred")

	// Panic logs and panics
	// log.Panic("Panic situation")
}
```

### 2\. Custom Logger

```Go
package main

import (
	"log"
	"os"
)

func main() {
	// Create custom logger
	logger := log.New(os.Stdout, "CUSTOM: ", log.Ldate|log.Ltime|log.Lshortfile)

	logger.Println("This is a custom log message")
}
```

### 3\. Logging to File

```Go
package main

import (
	"log"
	"os"
)

func main() {
	// Open log file
	file, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Failed to open log file:", err)
	}
	defer file.Close()

	// Set output to file
	log.SetOutput(file)

	log.Println("This will be written to the log file")
}
```

### 4\. Configuring Log Format

```Go
package main

import (
	"log"
)

func main() {
	// Set flags for standard logger
	log.SetFlags(log.Ldate | log.Ltime | log.Lmicroseconds | log.Llongfile)

	log.Println("This message has detailed timestamp and file info")
}
```

## Advanced Usage

### 1\. Multi-Writer Logging

```Go
package main

import (
	"io"
	"log"
	"os"
)

func main() {
	// Log to both file and stdout
	file, _ := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	defer file.Close()

	multiWriter := io.MultiWriter(os.Stdout, file)
	log.SetOutput(multiWriter)

	log.Println("This goes to both console and file")
}
```

### 2\. Log Levels Simulation

```Go
package main

import (
	"io/ioutil"
	"log"
	"os"
)

var (
	Info  *log.Logger
	Error *log.Logger
)

func init() {
	Info = log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	Error = log.New(os.Stderr, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)

	// For debug logging that can be disabled
	debug := false
	if !debug {
		log.SetOutput(ioutil.Discard)
	}
}

func main() {
	Info.Println("This is an info message")
	Error.Println("This is an error message")
}
```

## Best Practices

1.  **Use proper log levels** (info, warning, error)

2.  **Include context** in log messages

3.  **Configure log rotation** for production systems

4.  **Consider structured logging** for complex systems (using packages like `logrus` or `zap`)

5.  **Be mindful of performance** when logging in hot paths

## Common Use Cases

1.  Application debugging

2.  Error tracking and reporting

3.  Audit logging

4.  Operational monitoring

5.  Development diagnostics

The `log` package is particularly useful when:

*   You need simple, built-in logging

*   You want minimal dependencies

*   Basic logging suffices for your needs

*   You're writing a small to medium-sized application

Example of good logging practice:

```Go
func processRequest(req *Request) error {
	log.Printf("Processing request ID: %s", req.ID)

	if err := validate(req); err != nil {
		log.Printf("Validation failed for request %s: %v", req.ID, err)
		return err
	}

	// ... processing logic ...

	log.Printf("Successfully processed request %s", req.ID)
	return nil
}
```

For more advanced logging needs, consider these popular third-party packages:

*   **Logrus**: Structured logging

*   **Zap**: High-performance logging

*   **zerolog**: Simple JSON logging

*   **glog**: Leveled logging

The standard `log` package provides a solid foundation and is often sufficient for many applications.

# The `reflect` Package in Go

The `reflect` package in Go provides runtime reflection capabilities, allowing programs to manipulate objects with arbitrary types. It's a powerful but advanced feature that should be used judiciously.

## Key Features

### 1\. Type Inspection

*   Examine types at runtime

*   Get kind of type (struct, slice, map, etc.)

*   Access type metadata

### 2\. Value Manipulation

*   Read and modify values dynamically

*   Call functions reflectively

*   Create new instances

### 3\. Core Types

### `reflect.Type`

```Go
type Type interface {
    // Many methods to inspect the type
    Kind() Kind
    Name() string
    NumField() int // for structs
    NumMethod() int
    // ... and more
}
```

### `reflect.Value`

```Go
type Value struct {
    // contains filtered or unexported fields
}
// Methods to work with values
func (v Value) Kind() Kind
func (v Value) Type() Type
func (v Value) Interface() interface{}
// ... and more
```

## Common Usage Examples

### 1\. Basic Type Inspection

```Go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	var x float64 = 3.14
	fmt.Println("type:", reflect.TypeOf(x)) // float64
	fmt.Println("value:", reflect.ValueOf(x)) // <float64 Value>

	v := reflect.ValueOf(x)
	fmt.Println("kind:", v.Kind()) // float64
	fmt.Println("value:", v.Float()) // 3.14
}
```

### 2\. Working with Structs

```Go
package main

import (
	"fmt"
	"reflect"
)

type Person struct {
	Name string
	Age  int
}

func main() {
	p := Person{"Alice", 30}

	t := reflect.TypeOf(p)
	fmt.Println("Type:", t.Name()) // Person
	fmt.Println("Kind:", t.Kind()) // struct

	// Iterate over struct fields
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fmt.Printf("%d. %s (%s)\\n", i, field.Name, field.Type)
	}
}
```

### 3\. Modifying Values

```Go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	var x float64 = 3.14

	// Need pointer to modify value
	p := reflect.ValueOf(&x)
	v := p.Elem()

	fmt.Println("settability of v:", v.CanSet()) // true

	if v.CanSet() {
		v.SetFloat(2.71)
		fmt.Println(x) // 2.71
	}
}
```

### 4\. Calling Functions Dynamically

```Go
package main

import (
	"fmt"
	"reflect"
)

func Add(a, b int) int {
	return a + b
}

func main() {
	// Get function value
	funcValue := reflect.ValueOf(Add)

	// Prepare arguments
	args := []reflect.Value{
		reflect.ValueOf(10),
		reflect.ValueOf(20),
	}

	// Call the function
	results := funcValue.Call(args)

	fmt.Println(results[0].Int()) // 30
}
```

## Advanced Usage

### 1\. Creating New Instances

```Go
package main

import (
	"fmt"
	"reflect"
)

type MyStruct struct {
	Field1 string
	Field2 int
}

func main() {
	// Get type of MyStruct
	t := reflect.TypeOf(MyStruct{})

	// Create new instance
	v := reflect.New(t).Elem()

	// Set values
	v.Field(0).SetString("Hello")
	v.Field(1).SetInt(42)

	// Get back as interface{}
	s := v.Interface().(MyStruct)
	fmt.Printf("%+v\\n", s) // {Field1:Hello Field2:42}
}
```

### 2\. Working with Slices and Maps

```Go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	// Create slice reflectively
	intSlice := reflect.MakeSlice(reflect.TypeOf([]int{}), 0, 10)
	intSlice = reflect.Append(intSlice, reflect.ValueOf(1))
	intSlice = reflect.Append(intSlice, reflect.ValueOf(2))

	// Convert back to normal slice
	slice := intSlice.Interface().([]int)
	fmt.Println(slice) // [1 2]

	// Create map reflectively
	mapType := reflect.TypeOf(map[string]int{})
	mapValue := reflect.MakeMap(mapType)

	key := reflect.ValueOf("answer")
	value := reflect.ValueOf(42)
	mapValue.SetMapIndex(key, value)

	// Convert back to normal map
	m := mapValue.Interface().(map[string]int)
	fmt.Println(m) // map[answer:42]
}
```

## Best Practices and Warnings

1.  **Use sparingly**: Reflection is powerful but has costs
    
    *   Slower than direct code
    
    *   Bypasses compile-time type checking
    
    *   More complex and harder to maintain

2.  **Type safety**: Always check `Kind()` before operations

3.  **Performance**: Avoid in hot code paths

4.  **Alternatives**: Consider generics (Go 1.18+) or code generation first

## Common Use Cases

1.  Serialization/deserialization libraries

2.  ORMs and database mappers

3.  Dependency injection frameworks

4.  Protocol buffers and RPC systems

5.  Testing frameworks

6.  Configuration systems

The `reflect` package is particularly useful when:

*   You need to work with types unknown at compile time

*   You're writing generic utilities that must handle arbitrary types

*   You're implementing frameworks that need runtime type information

*   You're building tools that analyze or manipulate Go code structures

Example of a flexible print function:

```Go
func printDetails(i interface{}) {
	v := reflect.ValueOf(i)
	t := v.Type()

	fmt.Printf("Type: %s\\n", t)

	switch v.Kind() {
	case reflect.Struct:
		fmt.Println("Fields:")
		for i := 0; i < v.NumField(); i++ {
			field := t.Field(i)
			value := v.Field(i)
			fmt.Printf("  %s (%s) = %v\\n",
				field.Name, field.Type, value.Interface())
		}
	case reflect.Slice, reflect.Array:
		fmt.Println("Elements:")
		for i := 0; i < v.Len(); i++ {
			fmt.Printf("  [%d] = %v\\n", i, v.Index(i).Interface())
		}
	default:
		fmt.Println("Value:", v.Interface())
	}
}
```

1.  `container/ring` – Circular list.

2.  `sync` – Basic synchronization primitives (mutexes, wait groups).

3.  `sync/atomic` – Atomic operations.

4.  `encoding` – General encoding interfaces.

5.  `encoding/json` – JSON encoding/decoding.

6.  `encoding/xml` – XML encoding/decoding.

7.  `encoding/binary` – Binary (de)serialization.

8.  `encoding/csv` – CSV file handling.

9.  `encoding/gob` – Go binary serialization.

### **Networking & Web**

1.  `net` – Network I/O (TCP, UDP, DNS, etc.).

2.  `net/http` – HTTP client and server.

3.  `net/url` – URL parsing and manipulation.

4.  `net/http/cgi` – CGI (Common Gateway Interface) support.

5.  `net/http/cookiejar` – HTTP cookie storage.

6.  `net/http/httptest` – HTTP testing utilities.

7.  `net/http/httputil` – HTTP utility functions.

8.  `net/mail` – Email message parsing.

9.  `net/rpc` – Remote Procedure Call (RPC) framework.

10.  `net/rpc/jsonrpc` – JSON-RPC implementation.

11.  `net/smtp` – SMTP protocol support.

12.  `html` – HTML escaping and parsing.

13.  `html/template` – HTML templating with data safety.

### **Time & Date**

1.  `time` – Time and date operations.

### **Compression & Archives**

1.  `compress/gzip` – GZIP compression.

2.  `compress/zlib` – ZLIB compression.

3.  `compress/bzip2` – BZIP2 decompression.

4.  `compress/flate` – DEFLATE compression.

5.  `archive/tar` – TAR archive handling.

6.  `archive/zip` – ZIP archive handling.

### **Cryptography & Hashing**

1.  `crypto` – Common cryptographic interfaces.

2.  `crypto/aes` – AES encryption.

3.  `crypto/cipher` – Block cipher modes.

4.  `crypto/des` – DES encryption.

5.  `crypto/ecdsa` – ECDSA (Elliptic Curve Digital Signature Algorithm).

6.  `crypto/elliptic` – Elliptic curve operations.

7.  `crypto/hmac` – HMAC (Hash-based Message Authentication Code).

8.  `crypto/md5` – MD5 hashing.

9.  `crypto/rand` – Cryptographically secure random numbers.

10.  `crypto/rsa` – RSA encryption.

11.  `crypto/sha1` – SHA-1 hashing.

12.  `crypto/sha256` – SHA-256 hashing.

13.  `crypto/sha512` – SHA-512 hashing.

14.  `crypto/tls` – TLS (SSL) implementation.

15.  `crypto/x509` – X.509 certificate handling.

### **Testing & Debugging**

1.  `testing` – Go testing framework.

2.  `testing/quick` – Property-based testing.

3.  `testing/iotest` – I/O testing utilities.

4.  `runtime` – Go runtime interaction (GC, goroutines).

5.  `runtime/debug` – Debugging utilities.

6.  `runtime/pprof` – Profiling support.

7.  `runtime/trace` – Execution tracing.

### **Miscellaneous**

1.  `context` – Context management (cancellation, deadlines).

2.  `database/sql` – SQL database interface.

3.  `expvar` – Exposed variables for monitoring.

4.  `go/ast` – Abstract syntax tree (AST) manipulation.

5.  `go/parser` – Go source code parsing.

6.  `go/token` – Go token constants.

7.  `image` – Basic image manipulation.

8.  `image/color` – Color models.

9.  `image/draw` – Image composition.

10.  `image/jpeg` – JPEG image handling.

11.  `image/png` – PNG image handling.

12.  `path` – Path manipulation (slash-separated).

13.  `path/filepath` – OS-specific path handling.

14.  `plugin` – Dynamic plugin loading (Linux/macOS only).

15.  `regexp` – Regular expressions.

16.  `text/template` – Text templating.

17.  `text/scanner` – Text tokenizer.

18.  `vendor` – Go vendoring support.

This list covers most of the standard library, but you can always check the [official Go documentation](https://pkg.go.dev/std) for a complete and up-to-date list. Let me know if you need details on any specific package!