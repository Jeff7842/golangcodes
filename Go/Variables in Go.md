# Variables in Go.

## Table of Contents

1.  [Basic Variable Declaration](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

2.  [Type Inference](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

3.  [Zero Values](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

4.  [Short Variable Declaration](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

5.  [Constants](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

6.  [Variable Scope](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

7.  [Type Conversion](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

8.  [Pointers](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

9.  [Advanced Variable Techniques](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

10.  [Best Practices](Variables%20in%20Go%202091ccc344b180bea74ffd47fc8f3538.html)

## Basic Variable Declaration

In Go,we declare variables explicitly with their type:

```Go
var name string
var age int
var isActive bool
var loves string

```

You can declare and initialize in one step:

```Go
var name string = "Alice"
var age int = 30
var isActive bool = true
var loves string = "food"
```

Multiple variables can be declared together:

```Go
var (
    name     string = "Alice"
    age      int    = 30
    isActive bool   = true
)
var (
  address string="18th street"
)
```

## Type Inference

Go can infer types when you initialize variables:

```Go
var name = "Alice"  // type inferred as string
var age = 30       // type inferred as int
```

## Zero Values

Go assigns "zero values" to variables declared without initialization:

*   Numeric types: `0`

*   Boolean: `false`

*   Strings: `""` (empty string)

*   Pointers, slices, maps, channels, interfaces: `nil`

```Go
var i int     // 0
var f float64 // 0.0
var b bool    // false
var s string  // ""
```

## Short Variable Declaration

Inside functions, you can use the `:=` operator for concise declaration:

Also called `Walrus Operator`

```Go
name := "Alice"
age := 30
isActive := true
```

You can declare multiple variables at once:

```Go
name, age, isActive := "Alice", 30, true
address,home, isResident = "18th street", "here", true
```

This is especially useful in `if` statements and loops:

```Go
if age := getUserAge(); age >= 18 {
    fmt.Println("Adult")
}
```

## Constants

Constants are declared with `const` and must be initialized:

```Go
const Pi = 3.14159
const MaxUsers = 1000
```

Typed constants:

```Go
const Pi float64 = 3.14159
```

Multiple constants:

```Go
const (
    StatusOK      = 200
    StatusCreated = 201
)
```

## Variable Scope

*   **Package-level variables**: Declared outside functions, visible throughout package

*   **Local variables**: Declared inside functions, visible only within that function

*   **Block-level variables**: Declared within control structures, visible only in that block

```Go
package main

var globalVar = "I'm global" // package-level

func main() {
    localVar := "I'm local" // function-level

    if true {
        blockVar := "I'm in a block" // block-level
        fmt.Println(blockVar)
    }
    // fmt.Println(blockVar) // Error: undefined
}
```

## Type Conversion

Go requires explicit type conversion:

```Go
var i int = 42
var f float64 = float64(i)
var u uint = uint(f)
```

Between numeric types:

```Go
i := 42
f := float64(i)
u := uint(f)
```

String conversions:

```Go
s := string(65)      // "A" (ASCII 65)
i, err := strconv.Atoi("123") // string to int
s := strconv.Itoa(123)       // int to string
```

## Pointers

Go has pointers but no pointer arithmetic:

```Go
var x int = 10
var p *int = &x  // p points to x
fmt.Println(*p)  // dereference: 10
*p = 20          // change x through p
```

The `new` function allocates memory:

```Go
p := new(int)  // p is *int, points to zero value
*p = 100
```

## Advanced Variable Techniques

### Blank Identifier

Ignore values you don't need:

```Go
_, err := someFunction() // ignore first return value
```

# Variable Shadowing Pitfalls in Go

Variable shadowing occurs when a variable declared in an inner scope has the same name as a variable in an outer scope, effectively hiding the outer variable. Here are specific examples of how this can cause problems in Go:

## 1\. Accidental Shadowing in `if` Blocks

```Go
func processFile() error {
    file, err := os.Open("data.txt")
    if err != nil {
        return err
    }
    defer file.Close() // Will close the correct file

    if file, err := os.Open("other.txt"); err == nil { // Shadows both file and err
        // Work with the new file
        defer file.Close() // Will close other.txt
    }

    // Here we think we're working with data.txt but we might get unexpected results
    data := make([]byte, 100)
    _, err = file.Read(data) // Uses the outer file variable (data.txt)
    return err
}
```

## 2\. Shadowing in `for` Loops

```Go
func sumNumbers(numbers []int) int {
    sum := 0
    for i := 0; i < len(numbers); i++ {
        num := numbers[i]
        sum := sum + num // Shadows sum - creates new variable each iteration!
    }
    return sum // Always returns 0
}
```

## 3\. Package Name Shadowing

```Go
import "encoding/json"

func parseData() {
    json := "some string" // Shadows the json package
    // json.Unmarshal() // Compile error - json is now a string
}
```

## 4\. Shadowing with Short Variable Declarations in Multiple Return Functions

```Go
func getUser() (*User, error) {
    return &User{Name: "Alice"}, nil
}

func main() {
    user, err := getUser()
    if user, err := getUser(); err != nil { // Shadows both variables
        // This err is scoped to the if block
    }
    // Original user and err are unchanged here
}
```

## 5\. Shadowing with `:=` in Switch Statements

```Go
func checkStatus() error {
    status := "active"

    switch status {
    case "active":
        status := getDetailedStatus() // Shadows outer status
        fmt.Println("Detailed status:", status)
    case "inactive":
        // ...
    }

    fmt.Println("Status:", status) // Prints "active", not the detailed status
    return nil
}
```

## 6\. Shadowing Error Variables

```Go
func doSomething() error {
    if err := step1(); err != nil {
        return err
    }

    // Later in the same function
    result, err := step2()
    if err := step3(result); err != nil { // Shadows err from step2
        return err // Returns step3's error, losing step2's err if it existed
    }

    return nil
}
```

## How to Avoid Shadowing Issues

1.  Use unique variable names in nested scopes

2.  Be careful with `:=` in inner scopes

3.  Use the `go vet` tool with the `shadow` flag

4.  Consider using an IDE that highlights shadowed variables

5.  For package names, use an alias if you need a variable with the same name:
    
    ```Go
    import jsonpkg "encoding/json"
    ```

Shadowing can lead to subtle bugs that are hard to track down, so it's important to be aware of these patterns in your code.

```Go
x := 10
if x > 5 {
    x := 5  // shadows the outer x
    fmt.Println(x) // 5
}
fmt.Println(x) // 10
```

### Anonymous Structs

Create one-off struct types:

```Go
person := struct {
    name string
    age  int
}{
    name: "Alice",
    age:  30,
}
```

### Function Variables

Functions are first-class citizens:

```Go
add := func(a, b int) int {
    return a + b
}
result := add(3, 4)
```

### Variable Interfaces

Empty interface can hold any value:

```Go
var anything interface{}
anything = 42
anything = "hello"
anything = struct{}{}
```

### Type Assertion

Get concrete value from interface:

```Go
var val interface{} = "hello"
str := val.(string)  // type assertion
str, ok := val.(string)  // safe assertion
```

### Variable Aliases with Type

Create type aliases:

```Go
type Celsius float64
type Fahrenheit float64

var c Celsius = 20.0
var f Fahrenheit = 68.0
// c = f // Error: type mismatch
```

## Best Practices

1.  Use short declarations (`:=`) inside functions

2.  Declare variables as close to their use as possible

3.  Use meaningful variable names (avoid single letters except for indexes)

4.  Group related variables together

5.  Initialize variables when possible

6.  Be cautious with package-level variables (they can make code harder to reason about)

7.  Use `const` for values that shouldn't change

8.  Consider using `iota` for enumerated constants

9.  Be explicit with type conversions

10.  Use pointers judiciously - only when you need to modify the original value

## Advanced Example

Here's an example combining several advanced concepts:

```Go
package main

import (
	"fmt"
	"reflect"
)

type Currency string

const (
	USD Currency = "USD"
	EUR Currency = "EUR"
)

func main() {
	// Type alias usage
	balance := map[Currency]float64{
		USD: 100.50,
		EUR: 200.75,
	}

	// Pointer to map
	balancePtr := &balance

	// Modify through pointer
	(*balancePtr)[USD] = 150.25

	// Function variable
	showType := func(v interface{}) {
		fmt.Printf("Type: %v, Value: %v\\n", reflect.TypeOf(v), v)
	}

	// Anonymous struct
	transaction := struct {
		from   Currency
		to     Currency
		amount float64
	}{
		from:   USD,
		to:     EUR,
		amount: 50.0,
	}

	showType(balance)
	showType(balancePtr)
	showType(transaction)

	// Type switch
	var value interface{} = USD
	switch v := value.(type) {
	case Currency:
		fmt.Printf("It's a currency: %v\\n", v)
	case float64:
		fmt.Printf("It's a float: %v\\n", v)
	default:
		fmt.Printf("Unknown type: %T\\n", v)
	}
}
```

* * *

## More Resources

*   [Understanding Allocations in Go](https://medium.com/eureka-engineering/understanding-allocations-in-go-stack-heap-memory-9a2631b5035d)
*   [Go's Hidden Pragmas (Dave Cheney)](https://dave.cheney.net/2018/01/08/gos-hidden-pragmas)
*   [Video: Variables in Go](https://youtu.be/ZMZpH4yT7M0)