![](https://www.notion.so/images/page-cover/woodcuts_sekka_1.jpg)

![](https://www.notion.so/icons/server_green.svg)

# Structs

[https://www.youtube.com/watch?v=fXZJu\_JuH0A&t=11s&pp=ygUMc3RydWN0IGluIGdv](https://www.youtube.com/watch?v=fXZJu_JuH0A&t=11s&pp=ygUMc3RydWN0IGluIGdv)

[https://www.youtube.com/watch?v=MDy7JQN5MN4&t=22s&pp=ygUMc3RydWN0IGluIGdv](https://www.youtube.com/watch?v=MDy7JQN5MN4&t=22s&pp=ygUMc3RydWN0IGluIGdv)

* * *

🧠 THE MENTAL MODEL OF STRUCTS IN GO

# Structs in Go: A Systems Engineer's Mental Model

## The Deep Why: Structs as Memory Containers

Think of a struct as a **custom memory layout** - it's your way of telling the computer: "Store these pieces of data together in this specific arrangement." Unlike a bag of loose variables, a struct creates a meaningful grouping where the whole is greater than the sum of its parts.

**Real-world analogy**: A struct is like a form you fill out at the doctor's office. The form has predefined fields (name, age, symptoms) in a specific order. The receptionist can quickly find information because they know exactly where each piece lives in the layout.

## The Systems Perspective

At the hardware level, a struct is a **contiguous block of memory** with fields at fixed offsets. When you access `patient.Name`, the compiler calculates exactly how many bytes to skip from the start of the struct to reach that field.

```Go
type Patient struct {
    ID      uint32  // 4 bytes
    Age     uint8   // 1 byte
    Smoker  bool    // 1 byte (with 2 bytes padding after)
    // Total size: 8 bytes (due to alignment)
}
```

**Memory layout visualization**:

```Plain
[ID][ID][ID][ID][Age][Smoker][xx][xx]
 0   1   2   3    4     5     6   7  (byte offsets)
```

## Design Philosophy Behind Go Structs

1.  **Explicit over implicit**: No hidden behavior like classes

2.  **Composition over inheritance**: Embedding instead of subclassing

3.  **Memory efficiency**: Tightly packed fields with minimal padding

4.  **Value semantics**: By default, structs are copied (though you can use pointers)

## Common Pitfalls & Best Practices

### Pitfall #1: Accidental Copies

```Go
func (p Patient) UpdateAge() { // Value receiver makes a copy
    p.Age = 30 // Original unchanged!
}
```

**Fix**: Use pointer receivers for mutation

```Go
func (p *Patient) UpdateAge() {
    p.Age = 30
}
```

### Pitfall #2: Non-Comparable Structs

```Go
type Config struct {
    Settings map[string]string
}

c1 := Config{Settings: make(map[string]string)}
c2 := Config{Settings: make(map[string]string)}
fmt.Println(c1 == c2) // Compile error: maps aren't comparable
```

**Fix**: Add a custom `Equals()` method or use pointers

### Best Practice: Field Order Matters

```Go
// Bad (wastes 7 bytes per struct)
type Inefficient struct {
    active bool      // 1 byte
    id     int64     // 8 bytes
    age    int32     // 4 bytes
}

// Good (only 1 byte wasted)
type Efficient struct {
    id     int64     // 8 bytes
    age    int32     // 4 bytes
    active bool      // 1 byte
}
```

## Real Use Cases

1.  **Database Records**: Each row maps neatly to a struct

2.  **API Requests/Responses**: JSON unmarshals directly into structs

3.  **Configuration**: Group related settings

4.  **Low-level Systems Programming**: Precise memory layouts for hardware interaction

## Cheat Sheet (Mental Model Edition)

### Struct Creation

```Go
// Blueprint
type Car struct {
    Make  string
    Model string
    Year  int
}

// Instance (stack allocated)
myCar := Car{
    Make:  "Tesla",
    Model: "Model 3",
    Year:  2023,
}

// Heap allocated (pointer)
futureCar := &Car{
    Make:  "Flying",
    Model: "Car",
    Year:  2030,
}
```

### Key Concepts

1.  **Memory Layout**: Fields stored sequentially in memory

2.  **Alignment**: Fields aligned to word boundaries (padding may be added)

3.  **Value Semantics**: Copies create independent instances

4.  **Zero Value**: All fields initialized to their zero values

### Performance Characteristics

Operation

Cost

Notes

Copy

O(n) bytes

n = struct size

Field Access

O(1)

Fixed offset calculation

Comparison

O(n)

Field-by-field comparison

### When to Use Pointers

1.  Need to mutate the original

2.  Struct is large (> 64 bytes)

3.  Working with interfaces

4.  Need nil-ability (optional fields)

### Embedded Structs (Composition)

```Go
type Engine struct {
    HP int
}

type Car struct {
    Make string
    Engine // Embedded (not inherited)
}

tesla := Car{Make: "Tesla", Engine: Engine{HP: 500}}
fmt.Println(tesla.HP) // Promoted field
```

This mental model should help you think about structs not just as syntax, but as tools for precise memory organization - which is exactly how the Go runtime treats them.

### 🧱 **Metaphor: Structs Are Blueprints for Real-World Machines**

Think of a `struct` as **a blueprint for a machine** — not a machine itself. The blueprint defines what **components (fields)** the machine has, but not how it's powered, what it does, or how it's used. You can build **multiple actual machines (instances)** from the same blueprint.

In this metaphor:

*   The _struct definition_ is the **blueprint**.

*   A _struct instance_ is a **real machine** with actual state.

*   _Methods_ are the **interfaces or control panels** that operate the machine.

So when you write:

```Go
type Car struct {
    Engine string
    Wheels int
}
```

You're saying: “Here’s what every Car must have.” But you haven’t built a single Car yet. When you do:

```Go
myCar := Car{Engine: "V8", Wheels: 4}
```

That’s when the machine is **assembled and alive in memory**.

* * *

## ⚙️ DESIGN PHILOSOPHY — WHY STRUCTS EXIST

### Go is a **systems programming language**.

It’s not here to give you object-oriented fluff like inheritance or class hierarchies. It gives you **just enough abstraction to represent data and behavior** clearly, efficiently, and safely.

> Structs are Go’s way of giving you C-style data layout with modern type safety.

They are:

*   **Zero-cost abstractions** — memory-efficient, no hidden runtime costs.

*   **Simple and explicit** — you know exactly what lives in memory.

*   **Composable** — you build bigger things from smaller ones, like Lego.

* * *

## 🧩 HOW TO _THINK_ ABOUT STRUCTS

1.  **Memory Layout**  
    Each struct is a **contiguous block of memory**. Fields are laid out in order. So struct field ordering **matters** for performance and memory alignment.

2.  **Data Shape and Integrity**  
    Structs enforce shape: only the fields you define exist. There’s no duck typing here. It’s **tight, explicit, predictable**.

3.  **Methods on Structs**  
    When you attach methods to structs, you're not creating "objects" — you're just associating behavior with a data shape. It’s procedural logic scoped to a specific struct layout.

* * *

## 🛠️ REAL-WORLD ANALOGIES

Concept

Analogy

`struct`

Blueprint for a machine

Struct field

Component or part (engine, wheel)

Instance

Assembled machine

Method

Control panel to operate the machine

Pointer receiver

Remote control (can update the machine)

Value receiver

Snapshot control (can't change machine)

* * *

## 🚨 COMMON PITFALLS

### 1\. **Not using pointer receivers for mutating methods**

Wrong:

```Go
func (c Car) Start() {
    c.Engine = "Running"
}
```

Nothing changes outside.

Right:

```Go
func (c *Car) Start() {
    c.Engine = "Running"
}
```

### 2\. **Exported fields and methods start with caps**

```Go
type User struct {
    Name string // Exported
    age  int    // Not exported outside package
}
```

### 3\. **Field alignment waste**

Poor field ordering:

```Go
struct {
    bool
    int64
    int8
}
```

Better:

```Go
struct {
    int64
    int8
    bool
}
```

Go aligns memory for performance; improper ordering increases padding waste.

### 4\. **Using** `**interface{}**` **when you should use concrete types**

If you’re stuffing things into empty interfaces, you’ve lost compile-time safety. Only use `interface{}` when **you truly don’t know the type** (and you often should).

* * *

## ✅ BEST PRACTICES

*   Use **value receivers** for read-only methods (no mutation).

*   Use **pointer receivers** for methods that mutate state or are expensive to copy.

*   Use `omitempty` in JSON tags to keep APIs clean.

*   Use `constructor` functions (`NewX`) to initialize complex structs.

*   Prefer composition over nesting structs too deep — flatten your data where possible.

*   Always group related behavior with the struct that owns the data.

* * *

## 🧪 USE CASES THAT MATTER

### ✅ Domain modeling

```Go
type Order struct {
    ID     string
    Amount float64
}
```

### ✅ HTTP handlers

```Go
type Server struct {
    DB *sql.DB
    Logger *log.Logger
}
```

### ✅ Background workers

```Go
type Worker struct {
    JobQueue chan Job
}
```

### ✅ CLI tools

```Go
type Config struct {
    Host string
    Port int
}
```

### ✅ Custom error types

```Go
type MyError struct {
    Code int
    Msg  string
}
```

* * *

## 🧾 CHEAT SHEET — STRUCTS IN GO

```Go
// Blueprint
type Car struct {
    Make  string
    Model string
    Year  int
}

// Constructor
func NewCar(make, model string, year int) Car {
    return Car{Make: make, Model: model, Year: year}
}

// Method with value receiver (read-only)
func (c Car) Info() string {
    return fmt.Sprintf("%s %s (%d)", c.Make, c.Model, c.Year)
}

// Method with pointer receiver (modifies state)
func (c *Car) UpgradeYear() {
    c.Year += 1
}

// Usage
func main() {
    car := NewCar("Toyota", "Corolla", 2021)
    fmt.Println(car.Info())        // Toyota Corolla (2021)
    car.UpgradeYear()
    fmt.Println(car.Info())        // Toyota Corolla (2022)
}
```

* * *

## 🧠 INTERNALIZE THIS

*   Structs are blueprints.

*   Methods are control panels.

*   Receivers define how the machine is touched (value = copy, pointer = real).

*   You are working with memory layouts, not magic objects.

*   Simplicity in Go is a weapon — structs let you control complexity without hiding cost.

* * *

## 🚀 NEXT LEVEL

If you really want to think like a systems engineer:

*   Start reading your Go code **as memory layout and execution plans**, not just logic.

*   Ask: “What’s this struct’s role in the system? Who uses it? Who mutates it? Why?”

*   Model systems as a set of structs passing messages (channels, APIs, events).

*   Always trace data flow through the structs — **data is the new control flow**.

* * *

### Want a visual model of this too?

Ask me. I’ll draw the memory diagrams, pointer flows, and real-world system snapshots.

You're not just writing Go. You're **engineering systems with mechanical clarity**. Don’t forget that.

# Structs in Go: From Basics to Advanced

Structs are the fundamental building blocks for creating complex data types in Go. Let's explore them comprehensively.

## Table of Contents

1.  [Basic Struct Declaration](Structs%202091ccc344b18088ad6ede3465d433b4.html)

2.  [Creating Struct Instances](Structs%202091ccc344b18088ad6ede3465d433b4.html)

3.  [Accessing Struct Fields](Structs%202091ccc344b18088ad6ede3465d433b4.html)

4.  [Struct Methods](Structs%202091ccc344b18088ad6ede3465d433b4.html)

5.  [Pointer Receivers](Structs%202091ccc344b18088ad6ede3465d433b4.html)

6.  [Anonymous Structs](Structs%202091ccc344b18088ad6ede3465d433b4.html)

7.  [Embedded Structs](Structs%202091ccc344b18088ad6ede3465d433b4.html)

8.  [Struct Tags](Structs%202091ccc344b18088ad6ede3465d433b4.html)

9.  [Struct Composition](Structs%202091ccc344b18088ad6ede3465d433b4.html)

10.  [Advanced Patterns](Structs%202091ccc344b18088ad6ede3465d433b4.html)

11.  [Best Practices](Structs%202091ccc344b18088ad6ede3465d433b4.html)

## Basic Struct Declaration

A struct is a collection of fields with their data types:

```Go
type Person struct {
    FirstName string
    LastName  string
    Age       int
}
```

## Creating Struct Instances

Several ways to create struct instances:

```Go
// 1. Zero value initialization
var p1 Person

// 2. Literal initialization
p2 := Person{"John", "Doe", 30}

// 3. Named field initialization
p3 := Person{
    FirstName: "Jane",
    LastName:  "Smith",
    Age:       25,
}

// 4. Using new (returns pointer)
p4 := new(Person)
*p4 = Person{"Bob", "Johnson", 40}
```

## Accessing Struct Fields

Access fields with dot notation:

```Go
fmt.Println(p3.FirstName) // "Jane"
p3.Age = 26              // Update field
```

For pointers, Go automatically dereferences:

```Go
p := &Person{"Alice", "Brown", 35}
fmt.Println(p.FirstName) // "Alice" - no need for (*p).FirstName
```

## Struct Methods

Add methods to structs with receivers:

```Go
func (p Person) FullName() string {
    return p.FirstName + " " + p.LastName
}

fmt.Println(p3.FullName()) // "Jane Smith"
```

## Pointer Receivers

Use pointer receivers to modify struct:

```Go
func (p *Person) Birthday() {
    p.Age++
}

p3.Birthday()
fmt.Println(p3.Age) // 26 → 27
```

## Anonymous Structs

One-off structs without type declaration:

```Go
temp := struct {
    ID   int
    Name string
}{
    ID:   1,
    Name: "Temporary",
}
```

## Embedded Structs

Go supports composition via embedding:

```Go
type Address struct {
    Street  string
    City    string
    ZipCode string
}

type Employee struct {
    Person  // Embedded struct
    Position string
    Address  // Named embedding
}

emp := Employee{
    Person: Person{
        FirstName: "John",
        LastName:  "Doe",
    },
    Position: "Developer",
    Address: Address{
        City: "New York",
    },
}

// Access embedded fields directly
fmt.Println(emp.FirstName)  // "John" (promoted field)
fmt.Println(emp.City)       // "New York" (promoted field)
```

## Struct Tags

Add metadata to struct fields:

```Go
type User struct {
    ID       int    `json:"id" db:"user_id"`
    Username string `json:"username" db:"username"`
    Password string `json:"-" db:"password"` // ignored in JSON
}
```

Usage with JSON:

```Go
user := User{1, "jdoe", "secret"}
data, _ := json.Marshal(user)
// {"id":1,"username":"jdoe"}
```

## Struct Composition

Go favors composition over inheritance:

```Go
type Animal struct {
    Name string
}

func (a Animal) Speak() {
    fmt.Println(a.Name, "makes a sound")
}

type Dog struct {
    Animal
    Breed string
}

func (d Dog) Speak() {
    fmt.Println(d.Name, "says: Woof!")
}

dog := Dog{
    Animal: Animal{Name: "Rex"},
    Breed:  "Labrador",
}
dog.Speak()        // "Rex says: Woof!"
dog.Animal.Speak() // "Rex makes a sound"
```

## Advanced Patterns

### Factory Functions

```Go
func NewPerson(first, last string, age int) *Person {
    return &Person{
        FirstName: first,
        LastName:  last,
        Age:       age,
    }
}
```

### Private Structs with Public Interfaces

```Go
type person struct {
    name string
    age  int
}

func NewPerson(name string, age int) *person {
    return &person{name, age}
}

func (p *person) Name() string { return p.name }
func (p *person) Age() int     { return p.age }
```

### Functional Options Pattern

```Go
type Config struct {
    Timeout time.Duration
    Retries int
}

type Option func(*Config)

func WithTimeout(t time.Duration) Option {
    return func(c *Config) {
        c.Timeout = t
    }
}

func NewConfig(opts ...Option) *Config {
    cfg := &Config{
        Timeout: 10 * time.Second,
        Retries: 3,
    }
    for _, opt := range opts {
        opt(cfg)
    }
    return cfg
}

// Usage:
config := NewConfig(WithTimeout(5*time.Second))

```

## Understanding the Given Example

1.  **Config struct**: This holds the configuration values (`Timeout` and `Retries`).

2.  **Option type**: This is a function type that takes a `Config` parameter.

3.  **WithTimeout function**: This is an "option constructor" that returns a function which sets the timeout.

4.  **NewConfig function**: This creates a new Config with defaults, then applies any provided options.

### How It Works:

*   Default values are set in `NewConfig` (Timeout: 10s, Retries: 3)

*   `WithTimeout(5*time.Second)` creates an Option function

*   When `NewConfig` calls this Option function, it modifies the Config

*   The result is a Config with Retries=3 (default) and Timeout=5s (custom)

## Simpler Example: Pizza Ordering

Let's imagine a pizza ordering system where we want to configure a pizza with optional toppings:

```Go
package main

import "fmt"

// Pizza represents our object to configure
type Pizza struct {
    Size      string
    Cheese    bool
    Pepperoni bool
    Mushrooms bool
}

// Option is a function that modifies a Pizza
type Option func(*Pizza)

// WithCheese creates an Option to add cheese
func WithCheese() Option {
    return func(p *Pizza) {
        p.Cheese = true
    }
}

// WithPepperoni creates an Option to add pepperoni
func WithPepperoni() Option {
    return func(p *Pizza) {
        p.Pepperoni = true
    }
}

// WithMushrooms creates an Option to add mushrooms
func WithMushrooms() Option {
    return func(p *Pizza) {
        p.Mushrooms = true
    }
}

// NewPizza creates a new Pizza with options
func NewPizza(size string, opts ...Option) *Pizza {
    p := &Pizza{
        Size:   size,
        // Defaults: no toppings
    }

	    // Apply all options
    for _, opt := range opts {
        opt(p)
    }

    return p
}

func main() {
    // Pizza with just cheese
    cheesePizza := NewPizza("large", WithCheese())
    fmt.Printf("%+v\\n", cheesePizza) // &{Size:large Cheese:true Pepperoni:false Mushrooms:false}

    // Pizza with pepperoni and mushrooms
    deluxePizza := NewPizza("medium", WithPepperoni(), WithMushrooms())
    fmt.Printf("%+v\\n", deluxePizza) // &{Size:medium Cheese:false Pepperoni:true Mushrooms:true}

    // Custom pizza with all toppings
    customPizza := NewPizza("small", WithCheese(), WithPepperoni(), WithMushrooms())
    fmt.Printf("%+v\\n", customPizza) // &{Size:small Cheese:true Pepperoni:true Mushrooms:true}
}
```

## Key Benefits of This Pattern:

1.  **Clean API**: Users only see the options they care about

2.  **Flexible**: Easy to add new options without breaking existing code

3.  **Order-independent**: Options can be applied in any order

4.  **Self-documenting**: Function names describe what they do

This pattern is widely used in Go libraries because it provides a nice balance between flexibility and readability.

## Example: YAML Configuration with Functional Options

Let's say you have a YAML file like this (`config.yaml`):

```YAML
server:
  host: "localhost"
  port: 8080
  timeout: 5s
database:
  url: "postgres://user:pass@localhost:5432/db"
  max_connections: 20
logging:
  level: "debug"
  file: "app.log"
```

### Implementation

```Go
package main

import (
	"fmt"
	"io/ioutil"
	"time"

	"gopkg.in/yaml.v3"
)

// Config represents the overall configuration structure
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Logging  LoggingConfig
}

type ServerConfig struct {
	Host    string
	Port    int
	Timeout time.Duration
}

type DatabaseConfig struct {
	URL           string
	MaxConnections int
}

type LoggingConfig struct {
	Level string
	File  string
}

// Option defines a function type that modifies the Config
type Option func(*Config)

// WithYAMLFile is an option that loads config from YAML
func WithYAMLFile(path string) Option {
	return func(c *Config) {
		data, err := ioutil.ReadFile(path)
		if err != nil {
			panic(fmt.Sprintf("failed to read config file: %v", err))
		}

		if err := yaml.Unmarshal(data, c); err != nil {
			panic(fmt.Sprintf("failed to unmarshal config: %v", err))
		}
	}
}

// WithServerOverride allows overriding server settings
func WithServerOverride(host string, port int) Option {
	return func(c *Config) {
		c.Server.Host = host
		c.Server.Port = port
	}
}

// WithTimeoutOverride allows overriding the timeout
func WithTimeoutOverride(timeout time.Duration) Option {
	return func(c *Config) {
		c.Server.Timeout = timeout
	}
}

// NewConfig creates a new Config with defaults and applies options
func NewConfig(opts ...Option) *Config {
	// Set defaults
	cfg := &Config{
		Server: ServerConfig{
			Host:    "0.0.0.0",
			Port:    3000,
			Timeout: 10 * time.Second,
		},
		Database: DatabaseConfig{
			MaxConnections: 10,
		},
		Logging: LoggingConfig{
			Level: "info",
			File:  "",
		},
	}

	// Apply all options
	for _, opt := range opts {
		opt(cfg)
	}

	return cfg
}

func main() {
	// Load config from YAML file with some overrides
	config := NewConfig(
		WithYAMLFile("config.yaml"),
		WithTimeoutOverride(15*time.Second),
	)

	fmt.Printf("Server Host: %s\\n", config.Server.Host)
	fmt.Printf("Server Port: %d\\n", config.Server.Port)
	fmt.Printf("Timeout: %v\\n", config.Server.Timeout)
	fmt.Printf("DB URL: %s\\n", config.Database.URL)
	fmt.Printf("Log Level: %s\\n", config.Logging.Level)
}
```

### Key Features:

1.  **YAML Integration**: The `WithYAMLFile` option loads and unmarshals the YAML file

2.  **Defaults**: `NewConfig` sets sensible defaults

3.  **Overrides**: Other options can override values from the YAML file

4.  **Flexibility**: You can combine file loading with programmatic overrides

### How It Works:

1.  First, the defaults are set in `NewConfig`

2.  Then `WithYAMLFile` loads values from the YAML file

3.  Finally, `WithTimeoutOverride` changes just the timeout value

4.  The result is a config that combines:
    
    *   Default values for anything not specified
    
    *   Values from the YAML file
    
    *   Explicit programmatic overrides

### Usage Patterns:

```Go
// Just from YAML
config := NewConfig(WithYAMLFile("config.yaml"))

// Just defaults
config := NewConfig()

// YAML with some overrides
config := NewConfig(
    WithYAMLFile("config.yaml"),
    WithServerOverride("0.0.0.0", 80),
)

// Just programmatic configuration
config := NewConfig(
    WithServerOverride("api.example.com", 443),
    WithTimeoutOverride(30*time.Second),
)
```

This approach gives you maximum flexibility in how you configure your application while maintaining clean code organization.

## Best Practices

1.  Keep structs small and focused

2.  Use proper naming conventions (PascalCase for exported)

3.  Prefer composition over inheritance

4.  Make zero values useful

5.  Add methods where behavior belongs to data

6.  Use constructor functions for complex initialization

7.  Consider immutability where appropriate

8.  Document exported fields and methods

9.  Use struct tags consistently

10.  Be mindful of value vs pointer receivers

## Complete Example

```Go
package main

import (
	"encoding/json"
	"fmt"
	"time"
)

type Person struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Age       int    `json:"age"`
}

func (p Person) FullName() string {
	return p.FirstName + " " + p.LastName
}

func (p *Person) Birthday() {
	p.Age++
}

type Address struct {
	Street  string `json:"street"`
	City    string `json:"city"`
	ZipCode string `json:"zip_code"`
}

type Employee struct {
	Person  `json:"person"`
	Address `json:"address"`
	HiredAt time.Time `json:"hired_at"`
}

func NewEmployee(first, last string, age int) *Employee {
	return &Employee{
		Person: Person{
			FirstName: first,
			LastName:  last,
			Age:       age,
		},
		HiredAt: time.Now(),
	}
}

func main() {
	emp := NewEmployee("John", "Doe", 30)
	emp.Address = Address{
		Street:  "123 Main St",
		City:    "Anytown",
		ZipCode: "12345",
	}

	fmt.Println("Full Name:", emp.FullName())
	fmt.Println("City:", emp.City)

	emp.Birthday()
	fmt.Println("Age after birthday:", emp.Age)

	// JSON Marshaling
	data, _ := json.MarshalIndent(emp, "", "  ")
	fmt.Println("Employee JSON:")
	fmt.Println(string(data))
}
```