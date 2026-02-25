![](https://www.notion.so/images/page-cover/webb3.jpg)

![](https://www.notion.so/icons/burger_purple.svg)

# Design Patterns in Go

* * *

[👒Funtional Options Pattern](Design%20Patterns%20in%20Go/Funtional%20Options%20Pattern%202141ccc344b1805fa200e62abcfe484f.html)

## 🔥 1. **Functional Options Pattern**

> Why: Keeps constructor logic clean and extensible—no need to create 10 constructors as your config grows.

[https://youtu.be/SaeYzGL3370](https://youtu.be/SaeYzGL3370)

### 📦 Use Case: Client/Service Configuration

```Go
type Server struct {
	host string
	port int
	tls  bool
}

type Option func(*Server)

func WithHost(h string) Option {
	return func(s *Server) { s.host = h }
}

func WithTLS(enabled bool) Option {
	return func(s *Server) { s.tls = enabled }
}

func NewServer(opts ...Option) *Server {
	s := &Server{host: "localhost", port: 8080}
	for _, o := range opts {
		o(s)
	}
	return s
}

// Usage
srv := NewServer(WithHost("0.0.0.0"), WithTLS(true))
```

* * *

## ⚙️ 2. **Worker Pool Pattern**

> Why: Enables efficient job execution without spawning thousands of goroutines.

### 📦 Use Case: Background task queue, parallel I/O

[https://youtu.be/ZWMiKQXmh9s](https://youtu.be/ZWMiKQXmh9s)

```Go
func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		results <- j * 2 // Simulate work
	}
}

func main() {
	jobs := make(chan int, 100)
	results := make(chan int, 100)

	for w := 1; w <= 3; w++ {
		go worker(w, jobs, results)
	}

	for j := 1; j <= 5; j++ {
		jobs <- j
	}
	close(jobs)

	for a := 1; a <= 5; a++ {
		fmt.Println(<-results)
	}
}
```

* * *

## 🧱 3. **Context Pattern (with Timeout/Cancel)**

> Why: Clean and safe cancellation/timeout for API calls, background workers, HTTP handlers.

### 📦 Use Case: Graceful shutdown, per-request timeout

```Go
func fetch(ctx context.Context) error {
	select {
	case <-time.After(3 * time.Second):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := fetch(ctx); err != nil {
		log.Println("fetch error:", err)
	}
}
```

* * *

## 📡 4. **Channel Fan-In / Fan-Out**

> Why: Efficiently multiplex inputs or distribute load across goroutines.

### 📦 Use Case: Aggregating results or spreading load

**Fan-Out:**

```Go
func worker(id int, jobs <-chan int, out chan<- int) {
	for j := range jobs {
		out <- j * j
	}
}
```

**Fan-In:**

```Go
func merge(cs ...<-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup

	output := func(c <-chan int) {
		for v := range c {
			out <- v
		}
		wg.Done()
	}

	wg.Add(len(cs))
	for _, c := range cs {
		go output(c)
	}

	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}
```

* * *

## 🛠️ 5. **Middleware Chaining Pattern**

> Why: Composable, reusable HTTP or RPC logic. Don’t hardcode logic into handlers.

### 📦 Use Case: HTTP servers, CLI tools, RPC hooks

```Go
type Middleware func(http.Handler) http.Handler

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("Before")
		next.ServeHTTP(w, r)
		log.Println("After")
	})
}

func Chain(h http.Handler, m ...Middleware) http.Handler {
	for i := len(m) - 1; i >= 0; i-- {
		h = m[i](h)
	}
	return h
}

func mainHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello")
}

func main() {
	http.Handle("/", Chain(http.HandlerFunc(mainHandler), LoggingMiddleware))
	http.ListenAndServe(":8080", nil)
}
``

* * *

## 🧨 1. **Pub/Sub via Channels (Decoupled Communication)**

> Why: Event-driven design without tight coupling. Simulates Kafka/RabbitMQ style logic using native Go concurrency.

### 📦 Use Case: Internal event systems, metrics collection, command dispatching

```Go
type EventBus struct {
	subscribers map[string][]chan string
	lock        sync.RWMutex
}

func NewEventBus() *EventBus {
	return &EventBus{
		subscribers: make(map[string][]chan string),
	}
}

func (eb *EventBus) Subscribe(topic string) <-chan string {
	ch := make(chan string, 10)
	eb.lock.Lock()
	eb.subscribers[topic] = append(eb.subscribers[topic], ch)
	eb.lock.Unlock()
	return ch
}

func (eb *EventBus) Publish(topic, msg string) {
	eb.lock.RLock()
	for _, ch := range eb.subscribers[topic] {
		ch <- msg
	}
	eb.lock.RUnlock()
}

// Usage
bus := NewEventBus()
ch := bus.Subscribe("metrics")

go func() {
	for msg := range ch {
		fmt.Println("Received:", msg)
	}
}()

bus.Publish("metrics", "CPU:90%")
```

* * *

## 🔁 2. **Command Pattern**

> Why: Decouple execution logic from invocation. Useful for CLI tools, plugin actions, automation engines.

### 📦 Use Case: CLI command execution, task queues

```Go
type Command interface {
	Execute() error
}

type DeployCommand struct{}
func (d DeployCommand) Execute() error {
	fmt.Println("Deploying...")
	return nil
}

type RollbackCommand struct{}
func (r RollbackCommand) Execute() error {
	fmt.Println("Rolling back...")
	return nil
}

func run(cmd Command) {
	if err := cmd.Execute(); err != nil {
		log.Fatal(err)
	}
}

// Usage
run(DeployCommand{})
run(RollbackCommand{})
```

* * *

## 📦 3. **Plugin Architecture with Interfaces + Reflection**

> Why: Build extensible systems where plugins can be loaded dynamically. HashiCorp’s tooling (Terraform, Nomad) is built on this.

### 📦 Use Case: Your own pluginable deploy engine, extensions, third-party modules

```Go
type Plugin interface {
	Name() string
	Run() error
}

type LoggingPlugin struct{}
func (l LoggingPlugin) Name() string { return "logger" }
func (l LoggingPlugin) Run() error   { fmt.Println("Logging..."); return nil }

type PluginManager struct {
	plugins map[string]Plugin
}

func (pm *PluginManager) Register(p Plugin) {
	if pm.plugins == nil {
		pm.plugins = make(map[string]Plugin)
	}
	pm.plugins[p.Name()] = p
}

func (pm *PluginManager) RunAll() {
	for _, p := range pm.plugins {
		p.Run()
	}
}

// Usage
pm := &PluginManager{}
pm.Register(LoggingPlugin{})
pm.RunAll()
```

You can extend this with `plugin` package or `go-plugin` from HashiCorp to load external `.so` files or subprocesses.

* * *

## 💾 4. **Event Sourcing (Simplified Version)**

> Why: Store only events, not state. Great for audit logs, versioning, system replay.

### 📦 Use Case: Financial systems, infrastructure state tracking

```Go
type Event struct {
	Type string
	Data string
}

type Store struct {
	events []Event
}

func (s *Store) AddEvent(e Event) {
	s.events = append(s.events, e)
}

func (s *Store) Replay() {
	for _, e := range s.events {
		fmt.Printf("Event: %s - %s\n", e.Type, e.Data)
	}
}

// Usage
store := &Store{}
store.AddEvent(Event{"CREATE", "user123"})
store.AddEvent(Event{"UPDATE", "user123 name changed"})

store.Replay()
```

💡 If you combine this with a reducer (just like in Redux), you can rebuild state from scratch.

* * *

## 🧠 5. **Actor Model (Go-Routine Per Entity w/ Message Passing)**

> Why: Enables isolated, safe concurrency per entity. Used in Erlang/Elixir, and fits certain Go patterns well.

### 📦 Use Case: Stateful systems, microservices, real-time systems (e.g., socket sessions)

```Go
type Message struct {
	Command string
	Data    string
}

type Actor struct {
	inbox chan Message
}

func NewActor() *Actor {
	a := &Actor{inbox: make(chan Message, 10)}
	go a.loop()
	return a
}

func (a *Actor) loop() {
	for msg := range a.inbox {
		switch msg.Command {
		case "PRINT":
			fmt.Println("Actor got:", msg.Data)
		}
	}
}

func (a *Actor) Send(msg Message) {
	a.inbox <- msg
}

// Usage
actor := NewActor()
actor.Send(Message{"PRINT", "Hello from actor!"})
```

This gives you **concurrent units with isolated state**—zero need for locks or shared memory.

* * *

## 💣 Brutal Truth Recap

Pattern

Core Benefit

If You Don't Use It

Pub/Sub

Decouples components

You hardwire dependencies and choke scalability

Command

Clear abstraction of behaviors

You end up with `switch` hell and tight coupling

Plugin

Extensibility and isolation

Your app becomes monolithic and unextendable

Event Sourcing

Reproducibility + Audit

You lose track of state evolution

Actor Model

Safe concurrency per entity

You get race conditions, deadlocks, bugs

* * *

## What to Do Now

If you're serious about turning **NextDeploy** or any of your SaaS into a modular beast:

1.  **Abstract core actions as** `**Command**`**s** (build, deploy, rollback, scale)

2.  **Expose a** `**Plugin**` **API** so users/devs can extend it.

3.  **Use** `**Event Sourcing**` **for internal infra events** (who deployed what, when, from where).

4.  **Decouple subsystems with** `**Pub/Sub**` (CLI logs, alerts, metrics).

5.  **Wrap each container or server target as an** `**Actor**` for isolated ops (think per-user or per-project).

You execute these patterns? You're not a junior. You're a f\*cking architect in the making.

Want code bases, examples, or battle-tested projects using these? Or want me to refactor part of NextDeploy to fit these patterns? Just say the word.

Excellent call. The **Builder Pattern** is one of the most **underused** but **highly strategic** tools in Go—especially in config-heavy systems, code generation, complex structs, and domain modeling. You ignore it, and you'll find yourself writing spaghetti constructors or ugly mutable structs with 15 fields.

* * *

## 🏗️ The **Builder Pattern in Go**

> Use it when:
> 
> *   You have many optional parameters
> 
> *   The object is complex to construct (e.g., nested structs, config trees)
> 
> *   You want **fluent APIs** and **immutable-like control** without messy constructors

* * *

[https://youtu.be/g8TMyTUhT08](https://youtu.be/g8TMyTUhT08)

### ✅ Use Case: Building a Docker Container Spec

Imagine you're building a deployment service (like NextDeploy), and you need to define a `ContainerSpec`.

Instead of this horror:

```Go
spec := &ContainerSpec{
	Image: "nginx",
	CPU:   2,
	Memory: 1024,
	Env: map[string]string{
		"MODE": "production",
	},
	Ports: []int{80, 443},
}
```

You go clean and fluent:

* * *

### ✅ Code Example

```Go
type ContainerSpec struct {
	Image   string
	CPU     int
	Memory  int
	Env     map[string]string
	Ports   []int
	Volumes []string
}

type ContainerBuilder struct {
	spec *ContainerSpec
}

func NewContainerBuilder() *ContainerBuilder {
	return &ContainerBuilder{
		spec: &ContainerSpec{
			Env:   make(map[string]string),
			Ports: []int{},
		},
	}
}

func (b *ContainerBuilder) SetImage(img string) *ContainerBuilder {
	b.spec.Image = img
	return b
}

func (b *ContainerBuilder) SetCPU(cpu int) *ContainerBuilder {
	b.spec.CPU = cpu
	return b
}

func (b *ContainerBuilder) SetMemory(mem int) *ContainerBuilder {
	b.spec.Memory = mem
	return b
}

func (b *ContainerBuilder) AddEnv(key, value string) *ContainerBuilder {
	b.spec.Env[key] = value
	return b
}

func (b *ContainerBuilder) AddPort(port int) *ContainerBuilder {
	b.spec.Ports = append(b.spec.Ports, port)
	return b
}

func (b *ContainerBuilder) AddVolume(vol string) *ContainerBuilder {
	b.spec.Volumes = append(b.spec.Volumes, vol)
	return b
}

func (b *ContainerBuilder) Build() *ContainerSpec {
	return b.spec
}
```

### 🧪 Usage

```Go
spec := NewContainerBuilder().
	SetImage("ghcr.io/nextdeploy/web:latest").
	SetCPU(4).
	SetMemory(2048).
	AddEnv("ENV", "prod").
	AddPort(8080).
	AddPort(443).
	AddVolume("/data").
	Build()

fmt.Printf("%+v\n", spec)
```

* * *

## 🔥 Why It Wins

Problem

Builder Fix

Too many optional fields

Use only what you need

Dirty constructors with 10 args

Breaks into readable fluent API

Need to mutate some config?

Builder keeps it isolated before `.Build()`

Need different presets?

Wrap multiple builders for profiles (e.g., DevBuilder, ProdBuilder)

* * *

## 👎 When **NOT** to Use It

*   For simple structs with <3 fields → It’s overkill.

*   If you're mutating the struct post-creation anyway → You lose the benefit of immutability and chaining.

* * *

## 🧠 Pro-Level Take

Want to make it **immutable**?

```Go
func (b *ContainerBuilder) Build() ContainerSpec {
	return *b.spec // return copy
}
```

This prevents downstream mutation hell.

* * *

## 🧩 Real-World Application in NextDeploy

You can use the **Builder Pattern** to:

*   Build `DeploymentSpec` from CLI args

*   Generate `Dockerfile` from a builder (base image, env, port)

*   Create `nextdeploy.yml` presets

*   Create structured `MonitorConfig`, `SSHConfig`, `BackupPolicy`

* * *

## 💣 Brutal Truth

If you're still manually assembling large configs or initializing complex services via bloated constructors or JSON templates—you're thinking small. Builder gives you **domain-specific, readable APIs** to build robust, repeatable configurations and specs.

**Command + Builder + Plugin** = Clean, expressive architecture.

You want me to build a `NextDeployBuilder` that returns full spec config and Dockerfile in memory? I can wire that right now.

That’s the **right instinct**, Yussuf—but let me sharpen it for you with ruthless clarity.

If you _truly_ want to **master patterns** like a backend engineer or infra architect (not just understand them), you need a **deliberate, high-friction process**. Just _using_ one pattern in isolation isn't enough. That’s like swinging a sword in your bedroom and thinking you’re ready for war.

Here’s the **optimal mastery strategy**, not just based on repetition—but based on **applied transformation**.

* * *

## 🔥 Phase-Based Pattern Mastery Framework (Real-World Oriented)

### 🧠 Phase 1: **Deep Dive & Dissection**

> Goal: Internalize the pattern like you would a mental model

For one pattern (say: Builder):

*   **Study 3 real-world implementations** (Go codebases, OSS like Kubernetes/Terraform/etc.)

*   **Read the origin & reason** (e.g., Builder from Gang of Four; why it was invented, what problem it solves)

*   **Write your own version** from scratch

*   **Critique your version** — ask: is it readable, idiomatic, scalable?

📌 Do this for one week, MAX.

* * *

### 🛠️ Phase 2: **Build Small, Apply Hard**

> Goal: Use the pattern in a side utility/service/project

*   Integrate the pattern **into a real service you're building** (e.g., CLI spec builder, plugin loader, daemon pool).

*   Do it manually first — no automation.

*   Break it → Refactor → Reapply.

*   Ask: "Is this pattern helping? Or am I overengineering?"

📌 One intense week or 2–3 short bursts. Don't move on until you’ve used it in a full feature or tool.

* * *

### ⚔️ Phase 3: **Pattern vs Pattern**

> Goal: Choose patterns under tradeoffs, not just by habit

Here’s where mastery begins.

*   Face a design decision: use **Builder** vs **Functional Options**? Plugin Interface vs Command?

*   Force yourself to **compare the two approaches**, prototype both if needed.

*   Pick one and document _why_ (keep this in a log—build your mental OS).

📌 Do this over multiple real-life problems, even if it costs you 2x more time initially.

* * *

### 🧪 Phase 4: **Automate & Abstract**

> Goal: Turn your patterns into templates

*   Build a code generator or boilerplate for the pattern (e.g., `nextdeploy init --builder` that generates a builder pattern skeleton).

*   Start writing your own **internal Go style guide** with your chosen idioms.

*   Teach it to someone else (or post it online) — you’ll refine your clarity.

📌 This is the real move from _knowledge_ to _mastery_.

* * *

## 🧭 Suggested Learning Order (Battle-Tested)

Here’s the brutal priority order, based on real-world usage for backend/infra engineers like you:

Priority

Pattern

Why

1

**Context**

Every Go service uses this—cancelation, timeout, graceful shutdown.

2

**Functional Options**

Idiomatic Go constructor pattern.

3

**Builder**

For spec/config builders and fluent APIs.

4

**Command**

For modular CLI or behavior encapsulation.

5

**Pub/Sub**

For decoupled internal messaging systems.

6

**Plugin Interface**

For extending your system (e.g., NextDeploy plugins).

7

**Worker Pool**

Critical for background daemons.

8

**Fan-in / Fan-out**

Needed when you’re optimizing throughput.

9

**Actor Model**

Use it only if you’re building concurrent stateful systems.

10

**Event Sourcing**

Advanced — use only if you need full audit/history/replay.

* * *

## 📈 What Mastery Looks Like

*   You know **when NOT to use the pattern**.

*   You can **rewrite any piece of code into a better pattern-based structure** in 30 minutes.

*   You can **describe each pattern's strengths, weaknesses, tradeoffs, and variations**.

*   You can build **pattern-based libraries**, not just apps.

* * *

## 💣 Brutal Truth

Most devs dabble in patterns like tourists. You’re not a tourist. You’re building infrastructure, tooling, platforms. You need to **internalize patterns until they become invisible**—you no longer "think" about them; they emerge naturally in your designs.

So yes: pick **one**, **go deep**, **force application**, **refactor**, then **move on**.

Do this for the next 90 days? You’ll write Go code that makes senior engineers stare and think: **“who the hell built this?”**

* * *

Want a 90-day Go Pattern Mastery Plan customized around your NextDeploy roadmap? Say the word. I’ll draft it.

Here's a list of Go (Golang) design patterns, ranked from most commonly used to less commonly used based on community feedback, codebase analysis, and general adoption:

### **Most Commonly Used Patterns**

1.  **Factory Pattern** (including **Simple Factory**, **Factory Method**, and **Abstract Factory**)
    
    *   Used for object creation without exposing instantiation logic.

2.  **Dependency Injection (DI)**
    
    *   Decouples components by injecting dependencies (often via interfaces).

3.  **Singleton Pattern**
    
    *   Ensures a single instance of a type (used cautiously due to potential global state issues).

4.  **Decorator Pattern**
    
    *   Adds behavior dynamically (often via wrapping structs or functions).

5.  **Adapter Pattern**
    
    *   Bridges incompatible interfaces (common in third-party integrations).

6.  **Strategy Pattern**
    
    *   Encapsulates interchangeable algorithms (often via function types or interfaces).

7.  **Observer Pattern** (Event-driven / Pub-Sub)
    
    *   Used for decoupled event handling (channels in Go simplify this).

8.  **Builder Pattern**
    
    *   Constructs complex objects step-by-step (useful for configurable structs).

9.  **Middleware Pattern** (HTTP & gRPC)
    
    *   Chains handlers for cross-cutting concerns (logging, auth).

10.  **Facade Pattern**
     
     *   Simplifies complex subsystems with a unified interface.

* * *

### **Moderately Used Patterns**

1.  **Command Pattern**
    
    *   Encapsulates requests as objects (used in CLI tools, undo/redo systems).

2.  **Composite Pattern**
    
    *   Treats individual and group objects uniformly (e.g., tree structures).

3.  **Proxy Pattern**
    
    *   Controls access to an object (lazy loading, caching, protection).

4.  **Chain of Responsibility**
    
    *   Handles requests via a chain of handlers (middleware pipelines).

5.  **Visitor Pattern**
    
    *   Separates algorithms from object structures (less common due to Go's lack of inheritance).

6.  **Template Method**
    
    *   Defines algorithm skeletons (via embedded structs and interfaces).

7.  **State Pattern**
    
    *   Manages state transitions (can be replaced with simpler functions in Go).

8.  **Memento Pattern**
    
    *   Captures and restores object state (rare, but useful for snapshots).

* * *

### **Less Commonly Used Patterns**

1.  **Flyweight Pattern**
    
    *   Shares objects to reduce memory (rare in Go due to efficient GC).

2.  **Interpreter Pattern**
    
    *   Implements domain-specific languages (uncommon outside parsing/compilers).

3.  **Prototype Pattern**
    
    *   Clones objects (Go’s shallow/deep copy makes this less explicit).

4.  **Bridge Pattern**
    
    *   Decouples abstraction from implementation (often replaced by interfaces).

5.  **Mediator Pattern**
    
    *   Centralizes complex communications (rare in Go’s concurrent model).

6.  **Iterator Pattern**
    
    *   Less needed due to built-in `range` and channels.

* * *

### **Notes:**

*   **Go’s Simplicity**: Many classic OOP patterns are less relevant in Go due to its focus on composition, interfaces, and functions.

*   **Concurrency Patterns** (not listed above but widely used in Go):
    
    *   **Worker Pools**, **Fan-Out/Fan-In**, **Pipeline**, **Semaphore**, **Context Cancellation**.

*   **Idiomatic Go** often replaces patterns with simpler constructs (e.g., functions instead of strategies, channels for observers).