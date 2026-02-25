🧬

# Go best lessions

Here's a comprehensive list of Go patterns extracted from all the previous lessons, categorized by their purpose:

### **Concurrency Patterns**

1.  **Worker Pool** - Distribute work across multiple goroutines

2.  **Fan-out/Fan-in** - Split work among workers and combine results

3.  **Pipeline** - Chain processing stages with channels

4.  **Generator** - Function that returns a channel producing values

5.  **Timeout** - Use `select` with `time.After` for operation deadlines

6.  **Quit Channel** - Signal goroutines to stop using a channel

7.  **Heartbeat** - Periodic status updates from goroutines

8.  **Semaphore** - Channel-based resource limiting

9.  **Pub/Sub** - Broadcast messages to multiple receivers

10.  **Barrier** - Synchronize multiple goroutines at a point

### **Error Handling Patterns**

1.  **Error Wrapping** - Add context with `fmt.Errorf("%w")`

2.  **Sentinel Errors** - Predefined error values for specific conditions

3.  **Error Types** - Custom error types with additional context

4.  **Error Aggregation** - Combine multiple errors (e.g., `MultiError`)

5.  **Retry Mechanism** - Reattempt failed operations with backoff

6.  **Circuit Breaker** - Stop trying after repeated failures

### **Structural Patterns**

1.  **Functional Options** - Flexible API configuration
    
    ```Go
    type Config struct{}
    type Option func(*Config)
    ```

2.  **Decorator** - Wrap functions with additional behavior

3.  **Middleware** - Chain processing layers (common in HTTP handlers)

4.  **Dependency Injection** - Pass dependencies explicitly

5.  **Null Object** - Default no-op implementation (e.g., `io.Discard`)

### **Data Patterns**

1.  **Slice Tricks** (from Go wiki):
    
    *   Filtering: `s = append(s[:i], s[i+1:]...)`
    
    *   Reversing: `for i := len(s)/2-1; i >= 0; i-- { opp := len(s)-1-i; s[i],s[opp] = s[opp],s[i] }`

2.  **Map as Set** - `map[T]bool` or `map[T]struct{}`

3.  **Inverted Map** - Reverse key-value pairs

4.  **Memoization** - Cache function results

5.  **Sharded Map** - Split map for concurrent access

### **Object-Oriented Patterns**

1.  **Interface-Based Polymorphism** - Different types satisfying the same interface

2.  **Embedding** - Composition over inheritance

3.  **Builder** - Fluent API for object construction

4.  **Strategy** - Interchangeable algorithms via interfaces

5.  **Singleton** (with `sync.Once`):
    
    ```Go
    var (
        instance *T
        once     sync.Once
    )
    func GetInstance() *T {
        once.Do(func() { instance = &T{} })
        return instance
    }
    ```

### **Testing Patterns**

1.  **Table-Driven Tests** - Test cases in a slice
    
    ```Go
    func TestAdd(t *testing.T) {
        cases := []struct{ a, b, want int }{
            {1, 2, 3},
            {0, 0, 0},
        }
        for _, c := range cases {
            got := Add(c.a, c.b)
            if got != c.want { t.Errorf(...) }
        }
    }
    ```

2.  **Golden Files** - Compare output against saved "golden" files

3.  **Test Fixtures** - Reset state before each test

4.  **Interface Mocks** - Fake implementations for testing

### **Performance Patterns**

1.  **Object Pool** (`sync.Pool`) - Reuse expensive objects

2.  **Pre-allocation** - Specify capacity for slices/maps/channels

3.  **Batching** - Process items in chunks

4.  **Copy-on-Write** - Immutable data with cheap copies

### **Generic Patterns** (Go 1.18+)

1.  **Generic Data Structures** - Reusable containers (e.g., `Stack[T]`)

2.  **Type-Safe Functions** - Algorithms working with multiple types

3.  **Constraint Patterns** - Define allowed operations via interfaces

4.  **Higher-Order Generics** - Functions that accept/return generic functions

### **API Design Patterns**

1.  **Options Pattern** - Configurable initialization

2.  **Handle/Resource** - Separate instance from operations

3.  **Error Handling** - Return `(value, error)` pairs

4.  **Context Pattern** - Propagate cancellation/timeouts

### **Channel-Specific Patterns**

1.  **Done Channel** - Signal completion (`chan struct{}`)

2.  **Result Channel** - Collect outputs (`chan T`)

3.  **Teardown** - Cleanup with `defer close(ch)`

4.  **Select with Default** - Non-blocking operations

### **Error-Resilient Patterns**

1.  **Retry with Backoff** - Exponential retry delays

2.  **Circuit Breaker** - Fail fast after repeated errors

3.  **Bulkhead** - Isolate failures to components

4.  **Deadline Propagation** - Pass context deadlines through calls

### **Enum Patterns**

1.  **Iota Enums** - Auto-incrementing constants

2.  **String Enums** - Readable string values

3.  **Validation** - `IsValid()` methods for enums

4.  **JSON Marshaling** - Custom serialization

Each pattern addresses specific problems in Go development, from concurrency management to API design and error handling. Would you like me to elaborate on any particular pattern?