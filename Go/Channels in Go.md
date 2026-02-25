![](https://www.notion.so/icons/kite_green.svg)

# Channels in Go

# Channels in Go: From Basics to Advanced

Channels are a fundamental concurrency primitive in Go that enable goroutines to communicate safely.

## Table of Contents

1.  [Basic Channel Concepts](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

2.  [Channel Creation](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

3.  [Channel Operations](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

4.  [Buffered Channels](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

5.  [Channel Direction](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

6.  [Select Statement](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

7.  [Channel Patterns](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

8.  [Advanced Patterns](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

9.  [Performance Considerations](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

10.  [Best Practices](<Channels%20in%20Go%202091ccc344b1805181c4ce73d6fc8fac.html>)

## Basic Channel Concepts

*   Typed conduit for sending/receiving values between goroutines

*   Thread-safe by design (no explicit locking needed)

*   First-in-first-out (FIFO) behavior

*   Can be buffered or unbuffered

```Go
ch := make(chan int) // Create an unbuffered channel
go func() { ch <- 42 }() // Send value to channel
value := <-ch // Receive value from channel
```

## Channel Creation

Creating channels with different types:

```Go
unbuffered := make(chan int)       // Unbuffered channel
buffered := make(chan string, 10)  // Buffered channel (capacity 10)
structChan := make(chan struct{})  // Signal channel (no data)
```

## Channel Operations

### Basic Send/Receive

```Go
ch := make(chan int)

// Send operation (blocks until received in unbuffered)
go func() { ch <- 42 }()

// Receive operation (blocks until value available)
value := <-ch
```

### Closing Channels

```Go
close(ch) // Closes the channel

// Receiving from closed channel
val, ok := <-ch // ok=false if channel closed
```

### Range Over Channel

```Go
for item := range ch {
    // Process item until channel closed
}
```

## Buffered Channels

Channels with capacity (don't block until full):

```Go
ch := make(chan int, 3) // Buffer size 3

ch <- 1 // Doesn't block
ch <- 2
ch <- 3
// ch <- 4 // Would block (buffer full)
```

## Channel Direction

Specify send-only or receive-only channels:

```Go
func sender(ch chan<- int) { // Send-only channel
    ch <- 42
}

func receiver(ch <-chan int) { // Receive-only channel
    fmt.Println(<-ch)
}
```

## Select Statement

Handle multiple channel operations:

```Go
select {
case msg1 := <-ch1:
    fmt.Println(msg1)
case msg2 := <-ch2:
    fmt.Println(msg2)
case ch3 <- 3:
    fmt.Println("Sent 3")
default:
    fmt.Println("No activity")
}
```

## Channel Patterns

### Worker Pool

```Go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}

jobs := make(chan int, 100)
results := make(chan int, 100)

// Start workers
for w := 1; w <= 3; w++ {
    go worker(w, jobs, results)
}

// Send jobs
for j := 1; j <= 9; j++ {
    jobs <- j
}
close(jobs)

// Collect results
for a := 1; a <= 9; a++ {
    <-results
}
```

### Fan-out/Fan-in

```Go
// Fan-out: Multiple workers read from single channel
// Fan-in: Single worker reads from multiple channels
```

### Pipeline

```Go
func gen(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func sq(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

// Set up pipeline
c := gen(2, 3)
out := sq(c)

// Consume output
fmt.Println(<-out) // 4
fmt.Println(<-out) // 9
```

## Advanced Patterns

### Timeouts

```Go
select {
case res := <-ch:
    fmt.Println(res)
case <-time.After(1 * time.Second):
    fmt.Println("timeout")
}
```

### Non-blocking Operations

```Go
select {
case msg := <-ch:
    fmt.Println(msg)
default:
    fmt.Println("no message")
}
```

### Channel of Channels

```Go
var chans = []chan int{make(chan int), make(chan int)}

select {
case <-chans[0]:
case <-chans[1]:
}
```

### Quit Channel

```Go
quit := make(chan struct{})
go func() {
    for {
        select {
        case <-quit:
            return
        default:
            // Do work
        }
    }
}()
// Later...
close(quit) // Signal goroutine to exit
```

## Performance Considerations

1.  **Channel overhead** exists (consider mutexes for very high frequency)

2.  **Buffer size** affects performance (benchmark different sizes)

3.  **Many small goroutines** with channels can be efficient

4.  **Select with default** prevents blocking

5.  **Closed channel** operations are very fast

## Best Practices

1.  **Close channels** only from the sender side

2.  **Document channel ownership** (who closes, who sends)

3.  **Use buffered channels** when appropriate

4.  **Avoid mixing channels and mutexes** unless necessary

5.  **Prefer struct{}** for signal channels

6.  **Use select** for non-blocking operations

7.  **Keep channels simple** - complex channel logic is hard to debug

8.  **Consider context.Context** for cancellation

9.  **Profile channel usage** in performance-critical code

10.  **Avoid nil channels** (can cause deadlocks)

## Complete Example

```Go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	// Basic channel example
	message := make(chan string)
	go func() { message <- "ping" }()
	msg := <-message
	fmt.Println(msg)

	// Buffered channel
	buffered := make(chan int, 2)
	buffered <- 1
	buffered <- 2
	fmt.Println(<-buffered)
	fmt.Println(<-buffered)

	// Worker pool
	const numJobs = 5
	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)

	// Start workers
	for w := 1; w <= 3; w++ {
		go worker(w, jobs, results)
	}

	// Send jobs
	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs)

	// Collect results
	for a := 1; a <= numJobs; a++ {
		<-results
	}

	// Select with timeout
	c1 := make(chan string)
	go func() {
		time.Sleep(2 * time.Second)
		c1 <- "result 1"
	}()

	select {
	case res := <-c1:
		fmt.Println(res)
	case <-time.After(1 * time.Second):
		fmt.Println("timeout 1")
	}

	// Channel directions
	ch := make(chan int)
	go sendOnly(ch)
	receiveOnly(ch)

	// Pipeline
	nums := gen(1, 2, 3, 4)
	squared := sq(nums)
	for n := range squared {
		fmt.Println(n)
	}
}

func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		fmt.Println("worker", id, "processing job", j)
		time.Sleep(time.Second)
		results <- j * 2
	}
}

func sendOnly(ch chan<- int) {
	ch <- 42
}

func receiveOnly(ch <-chan int) {
	fmt.Println(<-ch)
}

func gen(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

func sq(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		for n := range in {
			out <- n * n
		}
		close(out)
	}()
	return out
}
```

