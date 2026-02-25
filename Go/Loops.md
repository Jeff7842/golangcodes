![](https://www.notion.so/images/page-cover/rijksmuseum_vermeer_the_milkmaid.jpg)

![](https://www.notion.so/icons/repeat_green.svg)

# Loops

# Loops in Go: From Basics to Advanced

Loops are fundamental control structures in Go programming. Let's explore all aspects of loops in Go, from basic syntax to advanced patterns.

## Table of Contents

1.  [Basic For Loop](Loops%202091ccc344b180d3b713e1ec694eb678.html)

2.  [While-Style Loop](Loops%202091ccc344b180d3b713e1ec694eb678.html)

3.  [Infinite Loop](Loops%202091ccc344b180d3b713e1ec694eb678.html)

4.  [Range-Based Loop](Loops%202091ccc344b180d3b713e1ec694eb678.html)

5.  [Loop Control Statements](Loops%202091ccc344b180d3b713e1ec694eb678.html)

6.  [Nested Loops](Loops%202091ccc344b180d3b713e1ec694eb678.html)

7.  [Common Loop Patterns](Loops%202091ccc344b180d3b713e1ec694eb678.html)

8.  [Performance Considerations](Loops%202091ccc344b180d3b713e1ec694eb678.html)

9.  [Advanced Patterns](Loops%202091ccc344b180d3b713e1ec694eb678.html)

10.  [Best Practices](Loops%202091ccc344b180d3b713e1ec694eb678.html)

## Basic For Loop

The standard `for` loop in Go:

```Go
for i := 0; i < 5; i++ {
    fmt.Println(i)
}
```

Components:

*   Initialization: `i := 0`

*   Condition: `i < 5`

*   Post statement: `i++`

## While-Style Loop

Go doesn't have a `while` keyword, but you can emulate it:

```Go
count := 0
for count < 5 {
    fmt.Println(count)
    count++
}
```

## Infinite Loop

Create an infinite loop by omitting all conditions:

```Go
for {
    fmt.Println("This will run forever")
    break // Needed to exit
}
```

Common uses:

*   Server main loops

*   Event handlers

*   REPL interfaces

## Range-Based Loop

Iterate over slices, arrays, maps, strings, and channels:

```Go
// Slice/array iteration
nums := []int{1, 2, 3}
for index, value := range nums {
    fmt.Printf("Index: %d, Value: %d\\n", index, value)
}

// Map iteration
m := map[string]int{"a": 1, "b": 2}
for key, value := range m {
    fmt.Printf("Key: %s, Value: %d\\n", key, value)
}

// String iteration (runes)
str := "hello"
for pos, char := range str {
    fmt.Printf("Position: %d, Character: %c\\n", pos, char)
}
```

## Loop Control Statements

### Break

Exit the loop immediately:

```Go
for i := 0; i < 10; i++ {
    if i == 5 {
        break
    }
    fmt.Println(i)
}
```

### Continue

Skip to the next iteration:

```Go
for i := 0; i < 10; i++ {
    if i%2 == 0 {
        continue
    }
    fmt.Println(i) // prints odd numbers
}
```

### Labeled Break/Continue

Control outer loops from nested loops:

```Go
outer:
for i := 0; i < 5; i++ {
    for j := 0; j < 5; j++ {
        if i*j > 6 {
            fmt.Println("Breaking outer")
            break outer
        }
        fmt.Println(i, j)
    }
}
```

## Nested Loops

Loops within loops:

```Go
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        fmt.Printf("(%d,%d) ", i, j)
    }
    fmt.Println()
}
```

## Common Loop Patterns

### Slice Processing

```Go
items := []string{"apple", "banana", "cherry"}
for i, item := range items {
    items[i] = strings.ToUpper(item)
}
```

### Map Processing

```Go
counts := map[string]int{"a": 1, "b": 2}
for key := range counts {
    counts[key]++
}
```

### Filtering

```Go
var filtered []int
for _, num := range []int{1, 2, 3, 4, 5} {
    if num%2 == 0 {
        filtered = append(filtered, num)
    }
}
```

### Batch Processing

```Go
const batchSize = 3
items := []int{1, 2, 3, 4, 5, 6, 7}

for i := 0; i < len(items); i += batchSize {
    end := i + batchSize
    if end > len(items) {
        end = len(items)
    }
    batch := items[i:end]
    processBatch(batch)
}
```

## Performance Considerations

1.  **Pre-allocate slices** when possible:
    
    ```Go
    // Better than appending in a loop
    result := make([]int, 0, len(input))
    ```

2.  **Avoid expensive operations** in loop conditions:
    
    ```Go
    // Bad - len(s) called each iteration
    for i := 0; i < len(s); i++ {}
    
    // Good - len(s) called once
    length := len(s)
    for i := 0; i < length; i++ {}
    ```

3.  **Range copies values** - use pointers or indexes for large structs:
    
    ```Go
    type BigStruct struct { /* many fields */ }
    bigSlice := []BigStruct{/*...*/}
    
    // Copies each element
    for _, v := range bigSlice { /* v is a copy */ }
    
    // More efficient
    for i := range bigSlice { /* work with bigSlice[i] */ }
    ```

## Advanced Patterns

### Generator Pattern

```Go
func countTo(max int) <-chan int {
    ch := make(chan int)
    go func() {
        for i := 0; i < max; i++ {
            ch <- i
        }
        close(ch)
    }()
    return ch
}

for num := range countTo(5) {
    fmt.Println(num)
}
```

### Pipeline Pattern

```Go
func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

nums := countTo(5)
squares := square(nums)
for n := range squares {
    fmt.Println(n)
}
```

### Worker Pool

```Go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Println("worker", id, "processing job", j)
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

## Best Practices

1.  **Keep loops focused** - one responsibility per loop

2.  **Avoid deep nesting** - refactor nested loops into functions

3.  **Use meaningful names** for loop variables (not just `i`, `j`)

4.  **Consider readability** over cleverness

5.  **Prefer range** when working with slices/maps

6.  **Document complex loops** with comments

7.  **Handle errors properly** in loops

8.  **Be careful with closures** in goroutines within loops

9.  **Limit loop scope** - declare variables as close to usage as possible

10.  **Profile performance** for critical loops

## Complete Example

```Go
package main

import (
	"fmt"
	"strings"
	"time"
)

func main() {
	// Basic for loop
	fmt.Println("Basic for loop:")
	for i := 0; i < 3; i++ {
		fmt.Println(i)
	}

	// While-style loop
	fmt.Println("\\nWhile-style loop:")
	count := 0
	for count < 3 {
		fmt.Println(count)
		count++
	}

	// Range loop with slice
	fmt.Println("\\nRange with slice:")
	fruits := []string{"apple", "banana", "cherry"}
	for i, fruit := range fruits {
		fmt.Printf("%d: %s\\n", i, fruit)
	}

	// Range loop with map
	fmt.Println("\\nRange with map:")
	ages := map[string]int{"Alice": 25, "Bob": 30}
	for name, age := range ages {
		fmt.Printf("%s is %d years old\\n", name, age)
	}

	// Range loop with string (runes)
	fmt.Println("\\nRange with string:")
	for pos, char := range "日本語" {
		fmt.Printf("%d: %c\\n", pos, char)
	}

	// Loop control with break/continue
	fmt.Println("\\nLoop control:")
	for i := 0; i < 10; i++ {
		if i == 2 {
			continue
		}
		if i == 5 {
			break
		}
		fmt.Println(i)
	}

	// Labeled break
	fmt.Println("\\nLabeled break:")
OuterLoop:
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			if i*j == 4 {
				fmt.Println("Breaking at", i, j)
				break OuterLoop
			}
			fmt.Println(i, j)
		}
	}

	// Worker pool pattern
	fmt.Println("\\nWorker pool pattern:")
	start := time.Now()
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
	fmt.Printf("Took %v\\n", time.Since(start))
}

func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		fmt.Printf("worker %d processing job %d\\n", id, j)
		time.Sleep(time.Second) // simulate work
		results <- j * 2
	}
}
```

This comprehensive guide covers loops in Go from basic to advanced concepts. Would you like me to elaborate on any particular aspect?