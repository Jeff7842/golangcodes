![](https://www.notion.so/icons/anchor_blue.svg)

# Interfaces in Go

[

Golang Interfaces Explained - Alex Edwards

For the past few months I've been running a survey which asks people what they're finding difficult about learning Go. And something that keeps coming up is the concept of interfaces.

![](https://www.alexedwards.net/static/img/favicon.ico)https://www.alexedwards.net/blog/interfaces-explained

](https://www.alexedwards.net/blog/interfaces-explained)

[https://youtu.be/rH0bpx7I2Dk](https://youtu.be/rH0bpx7I2Dk)

Perfect. Interfaces in Go are one of the deepest rabbit holes for mental models — and you _need_ to master them if you want to build clean, testable, idiomatic Go systems. Let’s not waste time.

* * *

# Interfaces in Go: A Systems Engineer's Mental Model

## The Core Philosophy: Contracts Over Hierarchies

Interfaces in Go represent a radical departure from traditional OOP. Instead of thinking "this object _is a_ something" (inheritance), we think "this object _can do_ something" (behavioral contracts).

**Analogy**: Consider USB ports. They don't care _what_ you plug in (flash drive, keyboard, charger) as long as the device fulfills the USB contract (shape, electrical specs, protocols). The interface is the USB standard, and implementations are the devices.

## Why Interfaces Exist in Go

1.  **Decoupling**: Allows components to interact without knowing concrete types

2.  **Testability**: Enables easy mocking of dependencies

3.  **Composition**: Lets types acquire capabilities organically

4.  **Flexibility**: Types can satisfy interfaces implicitly

## The Mental Model

### 1\. Interfaces as Requirements Documents

Think of an interface as a job description:

```Go
type Employee interface {
    Work(tasks []Task) (results []Result, err error)
    TakeBreak(duration time.Duration) error
}
```

Any type that can `Work` and `TakeBreak` qualifies for the "job" - the compiler doesn't care about the type's "resume" (concrete implementation).

### 2\. Duck Typing with Compile-Time Checks

"If it quacks like a duck, it's a duck" - but verified at compile time. Go doesn't care if you _intended_ to implement an interface, only that you _do_.

### 3\. Small Interfaces Are Powerful Interfaces

The most powerful interfaces in Go's standard library are tiny:

```Go
type Stringer interface {
    String() string
}
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

**Rule of thumb**: The more specific the interface, the more widely applicable it is.

## Systems Thinking: Interface Design Patterns

1.  **The Adapter Pattern**: Wrap incompatible types
    
    ```Go
    type MetricSender interface {
        SendMetric(name string, value float64)
    }
    
    // Adapt a logger to be a MetricSender
    type LoggerAdapter struct {
        Logger *log.Logger
    }
    func (l LoggerAdapter) SendMetric(name string, value float64) {
        l.Logger.Printf("metric %s=%.2f", name, value)
    }
    ```

2.  **The Strategy Pattern**: Swap algorithms at runtime
    
    ```Go
    type SortingAlgorithm interface {
        Sort([]int) []int
    }
    
    func ProcessData(data []int, sorter SortingAlgorithm) []int {
        // ... preprocessing ...
        return sorter.Sort(data)
    }
    ```

3.  **The Decorator Pattern**: Add behavior transparently
    
    ```Go
    type UserService interface {
        GetUser(id int) (*User, error)
    }
    
    type LoggingUserService struct {
        Service UserService
        Logger  *log.Logger
    }
    
    func (s LoggingUserService) GetUser(id int) (*User, error) {
        s.Logger.Printf("Getting user %d", id)
        return s.Service.GetUser(id)
    }
    ```

## Common Pitfalls & Best Practices

### Pitfalls:

1.  **Over-engineering**: Don't create interfaces before you need them

2.  **Giant interfaces**: They become hard to satisfy and maintain

3.  **Interface pollution**: Export interfaces only when consumers need them

4.  **Concrete types in function signatures**: This tightly couples your code

### Best Practices:

1.  **Accept interfaces, return structs**: Your functions should be flexible in what they accept but precise in what they return

2.  **Discover interfaces organically**: Write concrete code first, extract interfaces when needed

3.  **Single-method interfaces are gold**: They're incredibly flexible (`io.Reader`, `io.Writer`)

4.  **Use interface composition judiciously**:
    
    ```Go
    type ReadWriteCloser interface {
        Reader
        Writer
        Closer
    }
    ```

## Real-World Use Cases

1.  **Testing/Mocking**:
    
    ```Go
    // Production
    type DB interface {
        GetUser(id int) (*User, error)
    }
    
    // Test
    type mockDB struct {}
    func (m mockDB) GetUser(id int) (*User, error) {
        return &User{ID: id, Name: "Test User"}, nil
    }
    ```

2.  **Middleware**:
    
    ```Go
    type HTTPHandler interface {
        ServeHTTP(http.ResponseWriter, *http.Request)
    }
    
    type LoggingMiddleware struct {
        Handler HTTPHandler
    }
    ```

3.  **Plugin Architectures**:
    
    ```Go
    type Plugin interface {
        Initialize(config []byte) error
        Execute(ctx Context) (Result, error)
    }
    
    var plugins = make(map[string]Plugin)
    ```

## Cheat Sheet (Mental Model Edition)

### Core Principles:

1.  **Interfaces define capabilities, not identities**

2.  **Implicit satisfaction > explicit declaration**

3.  **Small interfaces compose better than large ones**

4.  **Interfaces belong with the consumer, not the implementer**

### The 4 Questions:

1.  **Does this abstraction reduce coupling?**

2.  **Could I mock this for testing?**

3.  **Would a smaller interface work?**

4.  **Who really needs to define this interface?**

### The 3 Rules of Thumb:

1.  **If you're not sure you need an interface, don't create one yet**

2.  **The** `**io.Reader**` **and** `**io.Writer**` **interfaces are your design mentors**

3.  **When you see interface{} (empty interface), ask if generics would be better (Go 1.18+)**

### The Power Trio:

```Go
// For single behaviors
type Doer interface {
    Do() error
}

// For configuration
type Configurer interface {
    Configure(config interface{}) error
}

// For lifecycle management
type Starter interface {
    Start(ctx context.Context) error
}
```

Remember: In Go, interfaces are the ultimate "speak softly" tool - they let your code carry a big stick (flexibility) without shouting about it (complex type hierarchies).

# Interfaces in Go: A Systems Engineer's Mental Model

## The Core Philosophy: Contracts Over Hierarchies

Interfaces in Go represent a radical departure from traditional OOP. Instead of thinking "this object _is a_ something" (inheritance), we think "this object _can do_ something" (behavioral contracts).

**Analogy**: Consider USB ports. They don't care _what_ you plug in (flash drive, keyboard, charger) as long as the device fulfills the USB contract (shape, electrical specs, protocols). The interface is the USB standard, and implementations are the devices.

## Why Interfaces Exist in Go

1.  **Decoupling**: Allows components to interact without knowing concrete types

2.  **Testability**: Enables easy mocking of dependencies

3.  **Composition**: Lets types acquire capabilities organically

4.  **Flexibility**: Types can satisfy interfaces implicitly

## The Mental Model

### 1\. Interfaces as Requirements Documents

Think of an interface as a job description:

```Go
type Employee interface {
    Work(tasks []Task) (results []Result, err error)
    TakeBreak(duration time.Duration) error
}
```

Any type that can `Work` and `TakeBreak` qualifies for the "job" - the compiler doesn't care about the type's "resume" (concrete implementation).

### 2\. Duck Typing with Compile-Time Checks

"If it quacks like a duck, it's a duck" - but verified at compile time. Go doesn't care if you _intended_ to implement an interface, only that you _do_.

### 3\. Small Interfaces Are Powerful Interfaces

The most powerful interfaces in Go's standard library are tiny:

```Go
type Stringer interface {
    String() string
}
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

**Rule of thumb**: The more specific the interface, the more widely applicable it is.

## Systems Thinking: Interface Design Patterns

1.  **The Adapter Pattern**: Wrap incompatible types
    
    ```Go
    type MetricSender interface {
        SendMetric(name string, value float64)
    }
    
    // Adapt a logger to be a MetricSender
    type LoggerAdapter struct {
        Logger *log.Logger
    }
    func (l LoggerAdapter) SendMetric(name string, value float64) {
        l.Logger.Printf("metric %s=%.2f", name, value)
    }
    ```

2.  **The Strategy Pattern**: Swap algorithms at runtime
    
    ```Go
    type SortingAlgorithm interface {
        Sort([]int) []int
    }
    
    func ProcessData(data []int, sorter SortingAlgorithm) []int {
        // ... preprocessing ...
        return sorter.Sort(data)
    }
    ```

3.  **The Decorator Pattern**: Add behavior transparently
    
    ```Go
    type UserService interface {
        GetUser(id int) (*User, error)
    }
    
    type LoggingUserService struct {
        Service UserService
        Logger  *log.Logger
    }
    
    func (s LoggingUserService) GetUser(id int) (*User, error) {
        s.Logger.Printf("Getting user %d", id)
        return s.Service.GetUser(id)
    }
    ```

## Common Pitfalls & Best Practices

### Pitfalls:

1.  **Over-engineering**: Don't create interfaces before you need them

2.  **Giant interfaces**: They become hard to satisfy and maintain

3.  **Interface pollution**: Export interfaces only when consumers need them

4.  **Concrete types in function signatures**: This tightly couples your code

### Best Practices:

1.  **Accept interfaces, return structs**: Your functions should be flexible in what they accept but precise in what they return

2.  **Discover interfaces organically**: Write concrete code first, extract interfaces when needed

3.  **Single-method interfaces are gold**: They're incredibly flexible (`io.Reader`, `io.Writer`)

4.  **Use interface composition judiciously**:
    
    ```Go
    type ReadWriteCloser interface {
        Reader
        Writer
        Closer
    }
    ```

## Real-World Use Cases

1.  **Testing/Mocking**:
    
    ```Go
    // Production
    type DB interface {
        GetUser(id int) (*User, error)
    }
    
    // Test
    type mockDB struct {}
    func (m mockDB) GetUser(id int) (*User, error) {
        return &User{ID: id, Name: "Test User"}, nil
    }
    ```

2.  **Middleware**:
    
    ```Go
    type HTTPHandler interface {
        ServeHTTP(http.ResponseWriter, *http.Request)
    }
    
    type LoggingMiddleware struct {
        Handler HTTPHandler
    }
    ```

3.  **Plugin Architectures**:
    
    ```Go
    type Plugin interface {
        Initialize(config []byte) error
        Execute(ctx Context) (Result, error)
    }
    
    var plugins = make(map[string]Plugin)
    ```

## Cheat Sheet (Mental Model Edition)

### Core Principles:

1.  **Interfaces define capabilities, not identities**

2.  **Implicit satisfaction > explicit declaration**

3.  **Small interfaces compose better than large ones**

4.  **Interfaces belong with the consumer, not the implementer**

### The 4 Questions:

1.  **Does this abstraction reduce coupling?**

2.  **Could I mock this for testing?**

3.  **Would a smaller interface work?**

4.  **Who really needs to define this interface?**

### The 3 Rules of Thumb:

1.  **If you're not sure you need an interface, don't create one yet**

2.  **The** `**io.Reader**` **and** `**io.Writer**` **interfaces are your design mentors**

3.  **When you see interface{} (empty interface), ask if generics would be better (Go 1.18+)**

### The Power Trio:

```Go
// For single behaviors
type Doer interface {
    Do() error
}

// For configuration
type Configurer interface {
    Configure(config interface{}) error
}

// For lifecycle management
type Starter interface {
    Start(ctx context.Context) error
}
```

Remember: In Go, interfaces are the ultimate "speak softly" tool - they let your code carry a big stick (flexibility) without shouting about it (complex type hierarchies).

## 🧠 MENTAL MODEL: _“Interfaces are Contracts — Not Classes”_

> Think electrical sockets and plugs.  
> The interface is the socket — it defines what kind of plug fits.  
> The implementation is the plug — anything that fits that socket can be used.

In Go, the socket doesn’t care _who_ built the plug or how it works inside.  
As long as it has the **right shape (method signatures)** — it works. That’s **structural typing**, not nominal typing like Java/C++/Rust.

* * *

## 🔥 WHY INTERFACES EXIST (Design Philosophy)

1.  **Decoupling**: Separate the _behavior_ you want from the _implementation_ that provides it.

2.  **Substitution Principle**: Code that depends on interfaces can work with any concrete type that satisfies the contract.

3.  **Composition Over Inheritance**: Go doesn’t have inheritance. Interfaces let you compose behavior from capabilities, not types.

4.  **Minimalism**: Go encourages **small, focused interfaces** (often just one method). This keeps systems **flexible and composable**.

> “Design to interfaces, not implementations.” — every senior engineer ever  
> In Go: “Design to behavior, not concrete types.”

* * *

## 🛠️ HOW IT WORKS UNDER THE HOOD (Systems Engineer Lens)

Go interfaces are essentially **two-word structures** under the hood:

*   A pointer to the actual data (`data`)

*   A pointer to a table of methods (`type`)

This is Go’s internal "interface value". When you pass an interface around, Go doesn’t know or care what the underlying type is — as long as the method exists.

> Like calling .Print() on a secret box — Go checks:  
> ❓Does this box have a Print() method?  
> ✅ Yes → Call it.  
> ❌ No → Compile or runtime error.

This dynamic dispatch is zero-cost when used right — and dangerous if abused.

* * *

## 🪞 ANALOGY: “Duck Typing With Discipline”

If it walks like a duck and quacks like a duck — it’s a duck.

But in Go, _you don’t even have to say you’re a duck_. You just need to quack in the right shape.

That’s **implicit interface satisfaction**.  
You don’t “declare” that a struct implements an interface. It just **does**, automatically, if the method set matches.

This is what gives Go its **flexibility and magic for testability**.

* * *

## 💣 COMMON PITFALLS (and how to avoid them)

### 1\. **Overusing interfaces**

You don’t need to define an interface _every time_.  
**Use interfaces at the consumer side, not the producer side.**

✅ GOOD:

```Go
func ReadData(r io.Reader) { ... } // accepts any Reader
```

❌ BAD:

```Go
type MyReader interface {
    Read(p []byte) (n int, err error)
}
func (m MyStruct) Read(...) {...}
```

Why? It’s overengineering. Let the consumer decide the abstraction.

* * *

### 2\. **Too fat interfaces**

Avoid big, godlike interfaces like:

```Go
type Repository interface {
    Save()
    Delete()
    Update()
    Query()
    Migrate()
    Rollback()
}
```

Instead, split by behavior:

```Go
type Saver interface { Save() }
type Deleter interface { Delete() }
```

This follows the **Interface Segregation Principle** — one of the SOLID principles.

* * *

### 3\. **Nil interface != nil**

```Go
var i interface{} = (*MyStruct)(nil)
fmt.Println(i == nil) // false 🤯
```

Why? Because `i` is not nil — it holds a type (`*MyStruct`) and a nil value.  
You need to check:

```Go
if i == nil || reflect.ValueOf(i).IsNil() { ... }
```

* * *

### 4\. **Interface{} (Empty Interface) abuse**

`interface{}` means “any type” — like `void*` in C.

Only use it when absolutely necessary (e.g., JSON unmarshalling, truly generic containers). Prefer **generics** when the type is known and matters.

* * *

## ✅ BEST PRACTICES

1.  **Use interfaces to depend on behavior, not implementation**

2.  **Accept interfaces, return concrete types**

3.  **Name interfaces by behavior:** `**Reader**`**,** `**Writer**`**,** `**Fetcher**`**,** `**Saver**`

4.  **Keep interfaces small — ideally 1-3 methods**

5.  **Avoid declaring interfaces unless you need to decouple a dependency**

6.  **Use interface values carefully — they can introduce runtime bugs**

7.  **Use interfaces in your tests to mock dependencies**

* * *

## ⚙️ REAL-WORLD USE CASES

### 1\. **I/O Abstraction**

```Go
func Copy(dst io.Writer, src io.Reader) { ... }
```

The code doesn’t care if it’s a file, buffer, socket — as long as it satisfies `Reader` and `Writer`.

* * *

### 2\. **Dependency Injection for Testability**

```Go
type Notifier interface {
    Send(msg string) error
}

func SendWelcomeEmail(n Notifier, user string) {
    n.Send("Welcome " + user)
}
```

Now you can inject `EmailNotifier`, `SMSNotifier`, or `MockNotifier` in tests.

* * *

### 3\. **Middleware for HTTP**

```Go
type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}
```

Every HTTP handler satisfies this. Middleware wraps handlers because they all implement this contract.

* * *

### 4\. **Plugin Systems**

Define a small interface, allow others to implement it however they want.

```Go
type Storage interface {
    Save(data []byte) error
    Load(id string) ([]byte, error)
}
```

Now you can plug in S3, local disk, Redis, anything.

* * *

## 📌 CHEAT SHEET: Go Interfaces (Rent-Free Version)

### 🔑 Principles

*   Define behavior, not types.

*   Small interfaces are powerful.

*   Consumer defines the interface, not the producer.

*   Implicit satisfaction is Go's superpower.

* * *

### 🧬 Structure

```Go
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

### 🧱 Implementing

```Go
type File struct {}

func (f File) Read(p []byte) (int, error) { ... }
```

No declaration needed. Just match the method signature.

* * *

### 🧪 Mocking

```Go
type DB interface {
    QueryUser(id int) (User, error)
}
```

Now in tests:

```Go
type MockDB struct{}

func (m MockDB) QueryUser(id int) (User, error) {
    return User{ID: id, Name: "Test"}, nil
}
```

* * *

### 🔍 Interface{} (Empty Interface)

```Go
func PrintAnything(x interface{}) {
    fmt.Println(x)
}
```

But prefer generics if type safety matters.

* * *

### 🧠 Testing Interface Satisfaction

```Go
var _ MyInterface = (*MyStruct)(nil)
```

This fails at compile time if `MyStruct` doesn't implement `MyInterface`.

* * *

### 🧼 Clean Patterns

```Go
// Don’t do this
type Fooer interface {
    Foo()
}
type Bar struct{}
func (b Bar) Foo() {}
```

**Only do this if multiple consumers need Fooer**.

* * *

## 🚀 TL;DR

*   Go interfaces are **contracts based on behavior**, not declarations.

*   They let you write **decoupled**, **testable**, **composable** code.

*   Use them **where you depend on behavior**, not identity.

*   Keep them **focused and minimal**.

*   **Don't overuse. Don't underuse.** Use them where it matters: **boundaries and abstractions.**

* * *

## 🧠 Thought Exercise (for you, Yussuf)

You’re building `NextDeploy`, right?

*   Define an interface like:

```Go
type Deployer interface {
    Deploy(app Config) error
}
```

*   Then create:

```Go
type SSHDeployer struct{}
type DockerDeployer struct{}
type MockDeployer struct{}
```

Now you can swap deploy backends, add tests, and extend functionality without ever touching core logic.

That's interface-driven design. That’s **system thinking**.

* * *

Want to go deeper next? Say the word and I’ll walk you through **interface internals**, **type switches**, **dynamic dispatch**, and how Go's approach compares to **Rust traits**, **Java interfaces**, and **Haskell typeclasses**.

Ready to go further?

# Interfaces in Go: From Basics to Advanced

Interfaces are one of Go's most powerful features, enabling polymorphism and clean abstraction. Let's explore them comprehensively.

## Table of Contents

1.  [Basic Interface Declaration](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

2.  [Implementing Interfaces](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

3.  [Interface Satisfaction](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

4.  [Empty Interface](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

5.  [Type Assertions](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

6.  [Type Switches](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

7.  [Interface Composition](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

8.  [Common Interfaces in Go](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

9.  [Advanced Patterns](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

10.  [Best Practices](Interfaces%20in%20Go%202091ccc344b1807b8bcee26af229a32f.html)

## Basic Interface Declaration

An interface defines a set of method signatures:

An interface type in Go is kind of like a _definition_. It defines and describes the exact methods that _some other type_ must have.

One example of an interface type from the standard library is the `[fmt.Stringer](https://pkg.go.dev/fmt/#Stringer)` interface, which looks like this:

```Go
type stringer interface {
 String() string
}
```

```Go
type Shape interface {
    Area() float64
    Perimeter() float64
}
```

We say that something _satisfies this interface_ (or _implements this interface_) if it has a method with the exact signature `String() string`.

For example, the following `Book` type satisfies the interface because it has a `String() string` method:

```Go
type Book struct {
Title string
Author string
}

func (b Book) String() string {
   return fmt.Sprintf("Book:%s - %s", b.Title, b.Author)
}
```

It does not matter what this `Book` type is or does. The only important thing is it has a method called `String()` which returns string value. Otherwise it does not the definition and it goes against the interface “contract”.

> _**Wherever you see declaration in Go (such as a variable, function parameter or struct field) which has an interface type, you can use an object of any type so long as it satisfies the interface.**_

## Implementing Interfaces

Types implicitly implement interfaces by implementing all methods:

```Go
type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}

// Rectangle now implements Shape
```

## Interface Satisfaction

Interfaces are satisfied implicitly:

```Go
func printShapeInfo(s Shape) {
    fmt.Printf("Area: %.2f, Perimeter: %.2f\\n", s.Area(), s.Perimeter())
}

rect := Rectangle{10, 5}
printShapeInfo(rect) // Works because Rectangle implements Shape
```

## Empty Interface

The empty interface `interface{}` can hold any value:

```Go
func printAnything(v interface{}) {
    fmt.Println(v)
}

printAnything(42)
printAnything("hello")
printAnything([]int{1, 2, 3})
```

## Type Assertions

Convert interface to concrete type:

```Go
var i interface{} = "hello"

s := i.(string) // type assertion
fmt.Println(s)  // "hello"

s, ok := i.(string) // safe assertion
fmt.Println(s, ok)  // "hello" true

f, ok := i.(float64) // safe assertion
fmt.Println(f, ok)   // 0 false

// f = i.(float64) // would panic
```

## Type Switches

Handle multiple types:

```Go
func describe(i interface{}) {
    switch v := i.(type) {
    case int:
        fmt.Printf("Integer: %d\\n", v)
    case string:
        fmt.Printf("String: %s\\n", v)
    default:
        fmt.Printf("Unknown type: %T\\n", v)
    }
}
```

## Interface Composition

Combine interfaces:

```Go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type ReadWriter interface {
    Reader
    Writer
}
```

## Common Interfaces in Go

### fmt.Stringer

```Go
type Stringer interface {
    String() string
}
```

### error

```Go
type error interface {
    Error() string
}
```

### io.Reader/Writer

```Go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}
```

## Advanced Patterns

### Dependency Injection

```Go
type Database interface {
    GetUser(id int) (*User, error)
}

type MySQLDatabase struct{}

func (m MySQLDatabase) GetUser(id int) (*User, error) {
    // implementation
}

type Service struct {
    db Database
}

func NewService(db Database) *Service {
    return &Service{db: db}
}

// Can pass any Database implementation
service := NewService(MySQLDatabase{})
```

### Interface Wrapping

```Go
type LoggingReader struct {
    Reader
}

func (r LoggingReader) Read(p []byte) (n int, err error) {
    n, err = r.Reader.Read(p)
    log.Printf("Read %d bytes, error: %v", n, err)
    return
}
```

### Mocking for Testing

```Go
type UserStore interface {
    GetUser(id int) (*User, error)
}

type MockUserStore struct{}

func (m MockUserStore) GetUser(id int) (*User, error) {
    return &User{ID: id, Name: "Test User"}, nil
}

func TestGetUser(t *testing.T) {
    store := MockUserStore{}
    user, err := store.GetUser(1)
    // test assertions
}
```

## Best Practices

1.  Keep interfaces small (1-3 methods typically)

2.  Name interfaces with "-er" suffixes when possible (Reader, Writer)

3.  Accept interfaces, return concrete types

4.  Prefer interfaces in function parameters

5.  Use interface composition to build larger interfaces

6.  Avoid empty interfaces when possible

7.  Document interface expectations

8.  Consider interface location (consumer or provider package)

9.  Use interfaces to enable testing

10.  Remember interfaces are reference types

## Complete Example

```Go
package main

import (
	"fmt"
	"math"
)

// Basic interface
type Shape interface {
	Area() float64
	Perimeter() float64
}

// Circle implements Shape
type Circle struct {
	Radius float64
}

func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
	return 2 * math.Pi * c.Radius
}

func (c Circle) String() string {
	return fmt.Sprintf("Circle(radius=%.2f)", c.Radius)
}

// Rectangle implements Shape
type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
	return 2 * (r.Width + r.Height)
}

func (r Rectangle) String() string {
	return fmt.Sprintf("Rectangle(width=%.2f, height=%.2f)", r.Width, r.Height)
}

// Function accepting interface
func printShape(s Shape) {
	fmt.Printf("%s - Area: %.2f, Perimeter: %.2f\\n", s, s.Area(), s.Perimeter())
}

// Type switch example
func describe(i interface{}) {
	switch v := i.(type) {
	case Shape:
		fmt.Printf("Shape with area %.2f\\n", v.Area())
	case string:
		fmt.Println("String:", v)
	default:
		fmt.Printf("Unknown type: %T\\n", v)
	}
}

func main() {
	shapes := []Shape{
		Circle{Radius: 5},
		Rectangle{Width: 3, Height: 4},
	}

	for _, shape := range shapes {
		printShape(shape)
	}

	describe(shapes[0])
	describe("hello")
	describe(42)

	// Type assertion
	var s Shape = Circle{Radius: 10}
	if circle, ok := s.(Circle); ok {
		fmt.Println("Circle radius:", circle.Radius)
	}
}
```

## **What is an interface in Go?**

`type Book struct {   Title string   Author string   }      func (b Book) String() string {   return fmt.Sprintf("Book: %s - %s", b.Title, b.Author)   }`

It's not really important what this `Book` type is or does. The only thing that matters is that is has a method called `String()` which returns a `string` value.

Or, as another example, the following `Count` type _also_ satisfies the `fmt.Stringer` interface — again because it has a method with the exact signature `String() string`.

`type Count int      func (c Count) String() string {   return strconv.Itoa(int(c))   }`

The important thing to grasp is that we have two different types, `Book` and `Count`, which do different things. But the thing they have in common is that they both satisfy the `fmt.Stringer` interface.

You can think of this the other way around too. If you know that an object satisfies the `fmt.Stringer` interface, you can rely on it having a method with the exact signature `String() string` that you can call.

Now for the important part.

_Wherever you see declaration in Go (such as a variable, function parameter or struct field) which has an interface type, you can use an object of any type_ _**so long as it satisfies the interface**_.

For example, let's say that you have the following function:

`func WriteLog(s fmt.Stringer) {   log.Print(s.String())   }`

Because this `WriteLog()` function uses the `fmt.Stringer` interface type in its parameter declaration, we can pass in any object that satisfies the `fmt.Stringer` interface. For example, we could pass either of the `Book` and `Count` types that we made earlier to the `WriteLog()` method, and the code would work OK.

Additionally, because the object being passed in satisfies the `fmt.Stringer` interface, we _know_ that it has a `String() string` method that the `WriteLog()` function can safely call.

Let's put this together in an example, which gives us a peek into the power of interfaces.

`package main      import (   "fmt"   "strconv"   "log"   )      // Declare a Book type which satisfies the fmt.Stringer interface.   type Book struct {   Title string   Author string   }      func (b Book) String() string {   return fmt.Sprintf("Book: %s - %s", b.Title, b.Author)   }      // Declare a Count type which satisfies the fmt.Stringer interface.   type Count int      func (c Count) String() string {   return strconv.Itoa(int(c))   }      // Declare a WriteLog() function which takes any object that satisfies   // the fmt.Stringer interface as a parameter.   func WriteLog(s fmt.Stringer) {   log.Print(s.String())   }      func main() {   // Initialize a Count object and pass it to WriteLog().   book := Book{"Alice in Wonderland", "Lewis Carrol"}   WriteLog(book)      // Initialize a Count object and pass it to WriteLog().   count := Count(3)   WriteLog(count)   }`

This is pretty cool. In the `main` function we've created different `Book` and `Count` types, but passed both of them to the _same_ `WriteLog()` function. In turn, that calls their relevant `String()` functions and logs the result.

If you [run the code](https://play.golang.org/p/DDQOFHxfOF8), you should get some output which looks like this:

`2009/11/10 23:00:00 Book: Alice in Wonderland - Lewis Carrol   2009/11/10 23:00:00 3`

I don't want to labor the point here too much. But the key thing to take away is that by using a interface type in our `WriteLog()` function declaration, we have made the function agnostic (or flexible) about the exact _type_ of object it receives. All that matters is _what methods it has_.

## **Why are they useful?**

There are all sorts of reasons that you might end up using a interface in Go, but in my experience the three most common are:

1.  To help reduce duplication or boilerplate code.

2.  To make it easier to use mocks instead of real objects in unit tests.

3.  As an architectural tool, to help enforce decoupling between parts of your codebase.

Let's step through these three use-cases and explore them in a bit more detail.

### **Reducing boilerplate code**

OK, imagine that we have a `Customer` struct containing some data about a customer. In one part of our codebase we want to write the customer information to a `[bytes.Buffer](https://pkg.go.dev/bytes/#Buffer)`, and in another part of our codebase we want to write the customer information to an `[os.File](https://pkg.go.dev/os/#File)` on disk. But in both cases, we want to serialize the customer struct to JSON first.

This is a scenario where we can use Go's interfaces to help reduce boilerplate code.

The first thing you need to know is that Go has an `[io.Writer](https://pkg.go.dev/io/#Writer)` interface type which looks like this:

`type Writer interface {   Write(p []byte) (n int, err error)   }`

And we can leverage the fact that both `[bytes.Buffer](https://pkg.go.dev/os/#pkg-variables)` and the `[os.File](https://pkg.go.dev/os/#File)` type satisfy this interface, due to them having the `[bytes.Buffer.Write()](https://pkg.go.dev/bytes/#Buffer.Write)` and `[os.File.Write()](https://pkg.go.dev/bytes/#Buffer.Write)` methods respectively.

Let's take a look at a simple implementation:

`package main      import (   "bytes"   "encoding/json"   "io"   "log"   "os"   )      // Create a Customer type   type Customer struct {   Name string   Age int   }      // Implement a WriteJSON method that takes an io.Writer as the parameter.   // It marshals the customer struct to JSON, and if the marshal worked   // successfully, then calls the relevant io.Writer's Write() method.   func (c *Customer) WriteJSON(w io.Writer) error {   js, err := json.Marshal(c)   if err != nil {   return err   }      _, err = w.Write(js)   return err   }      func main() {   // Initialize a customer struct.   c := &Customer{Name: "Alice", Age: 21}      // We can then call the WriteJSON method using a buffer...   var buf bytes.Buffer   err := c.WriteJSON(&buf)   if err != nil {   log.Fatal(err)   }      // Or using a file.   f, err := os.Create("/tmp/customer")   if err != nil {   log.Fatal(err)   }   defer f.Close()         err = c.WriteJSON(f)   if err != nil {   log.Fatal(err)   }   }`

Of course, this is just a toy example (and there are other ways we could structure the code to achieve the same end result). But it nicely illustrates the benefit of using an interface — we can create the `Customer.WriteJSON()` method once, and we can call that method any time that we want to write to something that satisfies the `io.Writer` interface.

But if you're new to Go, this still begs a couple of questions: _How do you know that the_ _`io.Writer`_ _interface even exists? And how do you know in advance that_ _`bytes.Buffer`_ _and_ _`os.File`_ _both satisfy it?_

There's no easy shortcut here I'm afraid — you simply need to build up experience and familiarity with the interfaces and different types in the standard library. Spending time thoroughly reading the standard library documentation, and looking at other people's code will help here. But as a quick-start I've included a list of some of the most useful interface types at the [end of this post](https://www.alexedwards.net/blog/interfaces-explained#useful-interface-types).

But even if you don't use the interfaces from the standard library, there's nothing to stop you from creating and using _your own interface types_. We'll cover how to do that next.

### **Unit testing and mocking**

To help illustrate how interfaces can be used to assist in unit testing, let's take a look at a slightly more complex example.

Let's say you run a shop, and you store information about the number of customers and sales in a PostgreSQL database. You want to write some code that calculates the sales rate (i.e. sales per customer) for the past 24 hours, rounded to 2 decimal places.

A minimal implementation of the code for that could look something like this:

File: main.go`      package main      import (   "fmt"   "log"   "time"   "database/sql"   _ "github.com/lib/pq"   )      type ShopDB struct {   *sql.DB   }      func (sdb *ShopDB) CountCustomers(since time.Time) (int, error) {   var count int   err := sdb.QueryRow("SELECT count(*) FROM customers WHERE timestamp > $1", since).Scan(&count)   return count, err   }      func (sdb *ShopDB) CountSales(since time.Time) (int, error) {   var count int   err := sdb.QueryRow("SELECT count(*) FROM sales WHERE timestamp > $1", since).Scan(&count)   return count, err   }      func main() {   db, err := sql.Open("postgres", "postgres://user:pass@localhost/db")   if err != nil {   log.Fatal(err)   }   defer db.Close()      shopDB := &ShopDB{db}   sr, err := calculateSalesRate(shopDB)   if err != nil {   log.Fatal(err)   }   fmt.Printf(sr)   }      func calculateSalesRate(sdb *ShopDB) (string, error) {   since := time.Now().Add(-24 * time.Hour)      sales, err := sdb.CountSales(since)   if err != nil {   return "", err   }      customers, err := sdb.CountCustomers(since)   if err != nil {   return "", err   }      rate := float64(sales) / float64(customers)   return fmt.Sprintf("%.2f", rate), nil   }`

Now, what if we want to create a unit test for the `calculateSalesRate()` function to make sure that the math logic in it is working correctly?

Currently this is a bit of a pain. We would need to set up a test instance of our PostgreSQL database, along with setup and teardown scripts to scaffold the database with dummy data. That's quite lot of work when all we really want to do is test our math logic.

So what can we do? You guessed it — interfaces to the rescue!

A solution here is to create our own interface type which describes the `CountSales()` and `CountCustomers()` methods that the `calculateSalesRate()` function relies on. Then we can update the signature of `calculateSalesRate()` to use this custom interface type as a parameter, instead of the concrete `*ShopDB` type.

Like so:

File: main.go`      package main      import (   "database/sql"   "fmt"   "log"   "time"      _ "github.com/lib/pq"   )      // Create our own custom ShopModel interface. Notice that it is perfectly   // fine for an interface to describe multiple methods, and that it should   // describe input parameter types as well as return value types.   type ShopModel interface {   CountCustomers(time.Time) (int, error)   CountSales(time.Time) (int, error)   }      // The ShopDB type satisfies our new custom ShopModel interface, because it   // has the two necessary methods -- CountCustomers() and CountSales().   type ShopDB struct {   *sql.DB   }      func (sdb *ShopDB) CountCustomers(since time.Time) (int, error) {   var count int   err := sdb.QueryRow("SELECT count(*) FROM customers WHERE timestamp > $1", since).Scan(&count)   return count, err   }      func (sdb *ShopDB) CountSales(since time.Time) (int, error) {   var count int   err := sdb.QueryRow("SELECT count(*) FROM sales WHERE timestamp > $1", since).Scan(&count)   return count, err   }      func main() {   db, err := sql.Open("postgres", "postgres://user:pass@localhost/db")   if err != nil {   log.Fatal(err)   }   defer db.Close()      shopDB := &ShopDB{db}   sr, err := calculateSalesRate(shopDB)   if err != nil {   log.Fatal(err)   }   fmt.Printf(sr)   }      // Swap this to use the ShopModel interface type as the parameter, instead of the   // concrete *ShopDB type.   func calculateSalesRate(sm ShopModel) (string, error) {   since := time.Now().Add(-24 * time.Hour)      sales, err := sm.CountSales(since)   if err != nil {   return "", err   }      customers, err := sm.CountCustomers(since)   if err != nil {   return "", err   }      rate := float64(sales) / float64(customers)   return fmt.Sprintf("%.2f", rate), nil   }`

With that done, it's straightforward for us to create a mock which satisfies our `ShopModel` interface. We can then use that mock during unit tests to test that the math logic in our `calculateSalesRate()` function works correctly. Like so:

File: main\_test.go`      package main      import (   "testing"   "time"   )      type MockShopDB struct{}      func (m *MockShopDB) CountCustomers(_ time.Time) (int, error) {   return 1000, nil   }      func (m *MockShopDB) CountSales(_ time.Time) (int, error) {   return 333, nil   }      func TestCalculateSalesRate(t *testing.T) {   // Initialize the mock.   m := &MockShopDB{}   // Pass the mock to the calculateSalesRate() function.   sr, err := calculateSalesRate(m)   if err != nil {   t.Fatal(err)   }      // Check that the return value is as expected, based on the mocked   // inputs.   exp := "0.33"   if sr != exp {   t.Fatalf("got %v; expected %v", sr, exp)   }   }`

You could run that test now, everything should work fine.

### **Application architecture**

In the previous examples, we've seen how interfaces can be used to decouple certain parts of your code from relying on concrete types. For instance, the `calculateSalesRate()` function is totally flexible about what you pass to it — the only thing that matters is that it satisfies the `ShopModel` interface.

You can extend this idea to create decoupled 'layers' in larger projects.

Let's say that you are building a web application which interacts with a database. If you create an interface that describes the exact methods for interacting with the database, you can refer to the interface throughout your HTTP handlers instead of a concrete type. Because the HTTP handlers only refer to an interface, this helps to decouple the HTTP layer and database-interaction layer. It makes it easier to work on the layers independently, and to swap out one layer in the future without affecting the other.

I've written about this pattern in [this previous blog post](https://www.alexedwards.net/blog/organising-database-access), which goes into more detail and provides some practical example code.

## **What is the empty interface?**

If you've been programming with Go for a while, you've probably come across the _empty interface type_: `interface{}`. This can be a bit confusing, but I'll try to explain it here.

At the start of this blog post I said:

> An interface type in Go is kind of like a definition. It defines and describes the exact methods that some other type must have.

The empty interface type essentially _describes no methods_. It has no rules. And because of that, it follows that any and every object satisfies the empty interface.

Or to put it in a more plain-English way, the empty interface type `interface{}` is kind of like a wildcard. Wherever you see it in a declaration (such as a variable, function parameter or struct field) you can use an object _of any type_.

Take a look at the following code:

`package main      import "fmt"         func main() {   person := make(map[string]interface{}, 0)      person["name"] = "Alice"   person["age"] = 21   person["height"] = 167.64      fmt.Printf("%+v", person)   }`

In this code snippet we initialize a `person` map, which uses the `string` type for keys and the empty interface type `interface{}` for values. We've assigned three different types as the map values (a `string`, `int` and `float32`) — and that's OK. Because objects of any and every type satisfy the empty interface, the code will work just fine.

You can [give it a try here](https://play.golang.org/p/GwxCQkLYNrq), and when you run it you should see some output which looks like this:

`map[age:21 height:167.64 name:Alice]`

But there's an important thing to point out when it comes to retrieving and using a value from this map.

For example, let's say that we want to get the `"age"` value and increment it by 1. If you write something like the following code, it will fail to compile:

`package main      import "log"      func main() {   person := make(map[string]interface{}, 0)      person["name"] = "Alice"   person["age"] = 21   person["height"] = 167.64      person["age"] = person["age"] + 1      fmt.Printf("%+v", person)   }`

And you'll get the following error message:

`invalid operation: person["age"] + 1 (mismatched types interface {} and int)`

This happens because the value stored in the map takes on the type `interface{}`, and ceases to have it's original, underlying, type of `int`. Because it's no longer an `int` type we cannot add 1 to it.

To get around this this, you need to type assert the value back to an `int` before using it. Like so:

`package main      import "log"      func main() {   person := make(map[string]interface{}, 0)      person["name"] = "Alice"   person["age"] = 21   person["height"] = 167.64      age, ok := person["age"].(int)   if !ok {   log.Fatal("could not assert value to int")   return   }      person["age"] = age + 1      log.Printf("%+v", person)   }`

If you [run this now](https://play.golang.org/p/3cB9emSdcRX), everything should work as expected:

`2009/11/10 23:00:00 map[age:22 height:167.64 name:Alice]`

So when should you use the empty interface type in your own code?

The answer is _probably not that often_. If you find yourself reaching for it, pause and consider whether using `interface{}` is really the right option. As a general rule it's clearer, safer and more performant to use concrete types — or non-empty interface types — instead. In the code snippet above, it would have been more appropriate to define a `Person` struct with relevant typed fields similar to this:

`type Person struct {   Name string   Age int   Height float32   }`

But that said, the empty interface is useful in situations where you need to accept and work with unpredictable or user-defined types. You'll see it used in a number of places throughout the standard library for that exact reason, such as in the `[gob.Encode](https://pkg.go.dev/encoding/gob/#Encoder.Encode)`, `[fmt.Print](https://pkg.go.dev/fmt/#Print)` and `[template.Execute](https://pkg.go.dev/text/template/#Template.Execute)` functions.

## **The any identifier**

Go 1.18 introduced a new [predeclared identifier](https://tip.golang.org/ref/spec#Predeclared_identifiers) called `[any](https://pkg.go.dev/builtin#any)`, which is an alias for the empty interface `interface{}`,

The `any` identifier is straight-up syntactic sugar – using it in your code is equivalent in all ways to using `interface{}`– it means exactly the same thing and has exactly the same behavior. So writing `map[string]any` in your code is exactly the same as writing `map[string]interface{}` in terms of it's behavior.

In most modern Go codebases, you'll normally see `any` being used rather than `interface{}`. This is simply because it's shorter and saves typing, and more clearly conveys to the reader that you can use _any type_ here.

## **Common and useful interface types**

Lastly, here's a short list of some of the most common and useful interfaces in the standard library. If you're not familiar with them already, then I recommend taking out a bit of time to look at the relevant documentation for them.

*   `[builtin.Error](https://pkg.go.dev/builtin/#error)`

*   `[fmt.Stringer](https://pkg.go.dev/fmt/#Stringer)`

*   `[io.Reader](https://pkg.go.dev/io/#Reader)`

*   `[io.Writer](https://pkg.go.dev/io/#Writer)`

*   `[io.ReadWriteCloser](https://pkg.go.dev/io/#ReadWriteCloser)`

*   `[http.ResponseWriter](https://pkg.go.dev/net/http/#ResponseWriter)`

*   `[http.Handler](https://pkg.go.dev/net/http/#Handler)`

There is also a longer and more comprehensive listing of standard libraries available in [this gist](https://gist.github.com/asukakenji/ac8a05644a2e98f1d5ea8c299541fce9).