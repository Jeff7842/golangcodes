# Understanding Allocations in Go

## Introduction

Thanks to efficient in-built memory management in the Go runtime, we’re generally able to prioritise correctness and maintainability in our programs without much consideration for the details of how allocations are occurring. From time to time though, we may discover performance bottlenecks in our code, and want to look a little deeper.

Anyone who’s run a benchmark with the `-benchmem` flag will have seen the `allocs/op` stat in output like the below. In this post we’ll look at what counts as an alloc and what we can do to influence this number.

```Plain
BenchmarkFunc-8  67836464  16.0 ns/op  8 B/op  1 allocs/op
```

# **The stack and heap we know and love**

To discuss the `allocs/op` stat in Go, we’re going to be interested in two areas of memory in our Go programs: _the stack_ and _the heap_.

In many popular programming environments _the stack_ usually refers to the call stack of a thread. A call stack is a LIFO stack data structure that stores arguments, local variables, and other data tracked as a thread executes functions. Each function call adds (pushes) a new frame to the stack, and each returning function removes (pops) from the stack.

We must be able to safely free the memory of the most recent stack frame when it’s popped. We therefore can’t store anything on the stack that later needs to be referenced elsewhere.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*t4_KKb6fEkINGsTwbcuk5w.png)](https://miro.medium.com/v2/resize:fit:700/1*t4_KKb6fEkINGsTwbcuk5w.png)

View of the call stack sometime after println has been called

Since threads are managed by the OS, the amount of memory available to a thread stack is typically fixed, e.g. a default of 8MB in many Linux environments. This means we also need to be mindful of how much data ends up on the stack, particularly in the case of deeply-nested recursive functions. If the stack pointer in the diagram above passes the stack guard, the program will crash with a stack overflow error.

_The heap_ is a more complex area of memory that has no relation to the data structure of the same name. We can use the heap on demand to store data needed in our program. Memory allocated here can’t simply be freed when a function returns, and needs to be carefully managed to avoid leaks and fragmentation. The heap will generally grow many times larger than any thread stack, and the bulk of any optimization efforts will be spent investigating heap use.

# **The Go stack and heap**

Threads managed by the OS are completely abstracted away from us by the Go runtime, and we instead work with a new abstraction: goroutines. Goroutines are conceptually very similar to threads, but they exist within user space. This means the runtime, and not the OS, sets the rules of how stacks behave.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*20Pk1_PXMWm_jMfPpCMfUg.png)](https://miro.medium.com/v2/resize:fit:700/1*20Pk1_PXMWm_jMfPpCMfUg.png)

Threads abstracted out of existence

Rather than having hard limits set by the OS, goroutine stacks start with a small amount of memory (currently 2KB). Before each function call is executed, a check within the function prologue is executed to verify that a stack overflow won’t occur. In the below diagram, the `convert()` function can be executed within the limits of the current stack size (without SP overshooting `stackguard0`).

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*nP17BbLqFA3LpyLGPDatgg.png)](https://miro.medium.com/v2/resize:fit:700/1*nP17BbLqFA3LpyLGPDatgg.png)

Close-up of a goroutine call stack

If this wasn’t the case, the runtime would copy the current stack to a new larger space of contiguous memory before executing `convert()`. This means that stacks in Go are dynamically sized, and can typically keep growing as long as there’s enough memory available to feed them.

The Go heap is again conceptually similar to the threaded model described above. All goroutines share a common heap and anything that can’t be stored on the stack will end up there. When a heap allocation occurs in a function being benchmarked, we’ll see the `allocs/ops` stat go up by one. It’s the job of the garbage collector to later free heap variables that are no longer referenced.

For a detailed explanation of how memory management is handled in Go, see [A visual guide to Go Memory Allocator from scratch](https://medium.com/@ankur_anand/a-visual-guide-to-golang-memory-allocator-from-ground-up-e132258453ed).

# **How do we know when a variable is allocated to the heap?**

This question is answered in the [official FAQ](https://golang.org/doc/faq#stack_or_heap).

> Go compilers will allocate variables that are local to a function in that function’s stack frame. However, if the compiler cannot prove that the variable is not referenced after the function returns, then the compiler must allocate the variable on the garbage-collected heap to avoid dangling pointer errors. Also, if a local variable is very large, it might make more sense to store it on the heap rather than the stack.
> 
> _If a variable has its address taken, that variable is a candidate for allocation on the heap. However, a basic escape analysis recognizes some cases when such variables will not live past the return from the function and can reside on the stack._

Since compiler implementations change over time, **there’s no way of knowing which variables will be allocated to the heap simply by reading Go code**. It is, however, possible to view the results of the _escape analysis_ mentioned above in output from the compiler. This can be achieved with the `gcflags` argument passed to `go build`. A full list of options can be viewed via `go tool compile -help`.

For escape analysis results, the `-m` option (`print optimization decisions`) can be used. Let’s test this with a simple program that creates two stack frames for functions `main1` and `stackIt`.

```Plain
func main1() {
   _ = stackIt()
}
//go:noinline
func stackIt() int {
   y := 2
   return y * 2
}
```

Since we can can’t discuss stack behaviour if the compiler removes our function calls, the `noinline` [pragma](https://dave.cheney.net/2018/01/08/gos-hidden-pragmas) is used to prevent inlining when compiling the code. Let’s take a look at what the compiler has to say about its optimization decisions. The `-l` option is used to omit inlining decisions.

```Plain
$ go build -gcflags '-m -l'
# github.com/Jimeux/go-samples/allocations
```

Here we see that no decisions were made regarding escape analysis. In other words, variable `y` remained on the stack, and didn’t trigger any heap allocations. We can verify this with a benchmark.

```Plain
$ go test -bench . -benchmem
BenchmarkStackIt-8  680439016  1.52 ns/op  0 B/op0 allocs/op
```

As expected, the `allocs/op` stat is `0`. An important observation we can make from this result is that **copying variables can allow us to keep them on the stack** and avoid allocation to the heap. Let’s verify this by modifying the program to avoid copying with use of a pointer.

```Plain
func main2() {
   _ = stackIt2()
}
//go:noinline
func stackIt2() *int {
   y := 2
   res := y * 2
   return &res
}
```

Let’s see the compiler output.

```Plain
go build -gcflags '-m -l'
# github.com/Jimeux/go-samples/allocations
./main.go:10:2:moved to heap: res
```

The compiler tells us it moved the pointer `res` to the heap, which triggers a heap allocation as verified in the benchmark below

```Plain
$ go test -bench . -benchmem
BenchmarkStackIt2-8  70922517  16.0 ns/op  8 B/op1 allocs/op
```

So does this mean pointers are guaranteed to create allocations? Let’s modify the program again to this time pass a pointer down the stack.

```Plain
func main3() {
   y := 2
   _ = stackIt3(&y) // pass y down the stack as a pointer
}

//go:noinline
func stackIt3(y *int) int {
   res := *y * 2
   return res
}
```

Yet running the benchmark shows nothing was allocated to the heap.

```Plain
$ go test -bench . -benchmem
BenchmarkStackIt3-8  705347884  1.62 ns/op  0 B/op0 allocs/op
```

The compiler output tells us this explicitly.

```Plain
$ go build -gcflags '-m -l'
# github.com/Jimeux/go-samples/allocations
./main.go:10:14:y does not escape
```

Why do we get this seeming inconsistency? `stackIt2` passes `res` _up the stack_ to `main`, where `y` will be referenced _after_ the stack frame of `stackIt2` has already been freed. The compiler is therefore able to judge that `y` must be moved to the heap to remain alive. If it didn’t do this, `y` wouldn’t exist by the time it was referenced in`main`.

`stackIt3`, on the other hand, passes `y` _down the stack_, and `y` isn’t referenced anywhere outside `main3`. The compiler is therefore able to judge that `y` can exist within the stack alone, and doesn’t need to be allocated to the heap. We won’t be able to produce a nil pointer in any circumstances by referencing `y`.

## Get James Kirk’s stories in your inbox

Join Medium for free to get updates from this writer.

Subscribe

**A general rule we can infer from this is that sharing pointers up the stack results in allocations, whereas sharing points down the stack doesn’t.** However, this is not guaranteed, so you’ll still need to verify with `gcflags` or benchmarks to be sure. What we can say for sure is that any attempt to reduce `allocs/op` will involve hunting out wayward pointers.

# **Why do we care about heap allocations?**

We’ve learnt a little about what the `alloc` in `allocs/op` means, and how to verify if an allocation to the heap is triggered, but why should we care if this stat is non-zero in the first place? The benchmarks we’ve already done can begin to answer this question.

```Plain
BenchmarkStackIt-8   6804390161.52 ns/op  0 B/op  0 allocs/op
BenchmarkStackIt2-8  7092251716.0 ns/op  8 B/op  1 allocs/op
BenchmarkStackIt3-8  7053478841.62 ns/op  0 B/op  0 allocs/op
```

Despite the memory requirements of the variables involved being almost equal, the relative CPU overhead of `BenchmarkStackIt2` is pronounced. We can get a little more insight by generating flame graphs of the CPU profiles of the `stackIt` and `stackIt2` implementations.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*czZGGPLuR-wsNt22Vf2PdQ.png)](https://miro.medium.com/v2/resize:fit:700/1*czZGGPLuR-wsNt22Vf2PdQ.png)

stackIt CPU profile

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*yj-4slhJ0L9lUxZG4gFxjQ.png)](https://miro.medium.com/v2/resize:fit:700/1*yj-4slhJ0L9lUxZG4gFxjQ.png)

stackIt2 CPU profile

`stackIt` has an unremarkable profile that runs predictably down the call stack to the `stackIt` function itself. `stackIt2`, on the other hand, is making heavy use of a large number of runtime functions that eat many additional CPU cycles. This demonstrates the complexity involved in allocating to the heap, and gives some initial insight into where those extra 10 or so nanoseconds per op are going.

# **What about in the real world?**

Many aspects of performance don’t become apparent without production conditions. Your single function may run efficiently in microbenchmarks, but what impact does it have on your application as it serves thousands of concurrent users?

We’re not going to recreate an entire application in this post, but we will take a look at some more detailed performance diagnostics using the [trace tool](https://golang.org/cmd/trace/). Let’s begin by defining a (somewhat) big struct with nine fields.

```Plain
type BigStruct struct {
   A, B, C int
   D, E, F string
   G, H, I bool
}
```

Now we’ll define two functions: `CreateCopy`, which copies `BigStruct` instances between stack frames, and `CreatePointer`, which shares `BigStruct` pointers up the stack, avoiding copying, but resulting in heap allocations.

```Plain
//go:noinline
func CreateCopy() BigStruct {
   return BigStruct{
      A: 123, B: 456, C: 789,
      D: "ABC", E: "DEF", F: "HIJ",
      G: true, H: true, I: true,
   }
}
//go:noinline
func CreatePointer() *BigStruct {
   return &BigStruct{
      A: 123, B: 456, C: 789,
      D: "ABC", E: "DEF", F: "HIJ",
      G: true, H: true, I: true,
   }
}
```

We can verify the explanation from above with the techniques used so far.

```Plain
$ go build -gcflags '-m -l'
./main.go:67:9:&BigStruct literal escapes to heap$ go test -bench . -benchmem
BenchmarkCopyIt-8     211907048  5.20 ns/op  0 B/op0 allocs/op
BenchmarkPointerIt-8  20393278   52.6 ns/op  80 B/op1 allocs/op
```

Here are the tests we’ll use for the `trace` tool. They each create 20,000,000 instances of `BigStruct` with their respective `Create` function.

```Plain
const creations = 20_000_000

func TestCopyIt(t *testing.T) {
   for i := 0; i < creations; i++ {
      _ = CreateCopy()
   }
}

func TestPointerIt(t *testing.T) {
   for i := 0; i < creations; i++ {
      _ = CreatePointer()
   }
}
```

Next we’ll save the trace output for `CreateCopy` to file `copy_trace.out`, and open it with the trace tool in the browser.

```Plain
$ go test -run TestCopyIt -trace=copy_trace.out
PASS
ok   github.com/Jimeux/go-samples/allocations 0.281s$ go tool trace copy_trace.out
Parsing trace...
Splitting trace...
Opening browser. Trace viewer is listening on http://127.0.0.1:57530
```

Choosing `View trace` from the menu shows us the below, which is almost as unremarkable as our flame chart for the `stackIt` function. Only two of eight potential logical cores (Procs) are utilised, and goroutine G19 spends just about the entire time running our test loop — which is what we want.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*NKzN-hax5TfP3PYsLzwozg.png)](https://miro.medium.com/v2/resize:fit:700/1*NKzN-hax5TfP3PYsLzwozg.png)

Trace for 20,000,000 CreateCopy calls

Let’s generate the trace data for the `CreatePointer` code.

```Plain
$ go test -run TestPointerIt -trace=pointer_trace.out
PASS
ok   github.com/Jimeux/go-samples/allocations 2.224sgo tool trace pointer_trace.out
Parsing trace...
Splitting trace...
Opening browser. Trace viewer is listening onhttp://127.0.0.1:57784
```

You may have already noticed the test took 2.224s compared to 0.281s for `CreateCopy`, and selecting `View trace` displays something much more colourful and busy this time. All logical cores were utilised and there appears to be a lot more heap action, threads, and goroutines than last time.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*_DwGUNYyWcNJ_OlCi48ctA.png)](https://miro.medium.com/v2/resize:fit:700/1*_DwGUNYyWcNJ_OlCi48ctA.png)

Trace for 20,000,000 `CreatePointer` calls

If we zoom in to a millisecond or so span of the trace, we see many goroutines performing operations related to [garbage collection](https://www.ardanlabs.com/blog/2018/12/garbage-collection-in-go-part1-semantics.html). The quote earlier from the FAQ used the phrase _**garbage-collected heap**_ because it’s the job of the garbage collector to clean up anything on the heap that is no longer being referenced.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*9TJdonaURcVKcWb4WeaP1Q.png)](https://miro.medium.com/v2/resize:fit:700/1*9TJdonaURcVKcWb4WeaP1Q.png)

Close-up of GC activity in the CreatePointer trace

Although Go’s garbage collector is increasingly efficient, the process doesn’t come for free. We can verify visually that the test code stopped completely at times in the above trace output. This wasn’t the case for `CreateCopy`, since all of our `BigStruct` instances remained on the stack, and the GC had very little to do.

Comparing the goroutine analysis from the two sets of trace data offers more insight into this. `CreatePointer` (bottom) spent over 15% of its execution time sweeping or pausing (GC) and scheduling goroutines.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*NaxhI4aXkyLh6ez9Nvqo3A.png)](https://miro.medium.com/v2/resize:fit:700/1*NaxhI4aXkyLh6ez9Nvqo3A.png)

Top-level goroutine analysis for CreateCopy

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*DR8vDjAy8RkJfHxf9XlH0g.png)](https://miro.medium.com/v2/resize:fit:700/1*DR8vDjAy8RkJfHxf9XlH0g.png)

Top-level goroutine analysis for CreatePointer

A look at some of the stats available elsewhere in the trace data further illustrates the cost of heap allocation, with a stark difference in the number of goroutines generated, and almost 400 STW (stop the world) events for the `CreatePointer` test.

```Plain
+------------+------+---------+
|            | Copy | Pointer |
+------------+------+---------+
| Goroutines |   41 |  406965 |
| Heap       |   10 |  197549 |
| Threads    |   15 |   12943 |
| bgsweep    |    0 |  193094 |
| STW        |    0 |     397 |
+------------+------+---------+
```

Do keep in mind though that the conditions of the `CreateCopy` test are very unrealistic in a typical program, despite the title of this section. It’s normal to see the GC using a consistent amount of CPU, and pointers are a feature of any real program. However, this together with the flame graph earlier gives us some insight into why we may want to track the `allocs/op` stat, and avoid unnecessary heap allocations when possible.

# **Summary**

Hopefully this post gave some insight into the differences between the stack and heap in a Go program, the meaning of the `allocs/op` stat, and some of the ways in which we can investigate memory usage.

The correctness and maintainability of our code is usually going to take precedence over tricky techniques to reduce pointer usage and skirt GC activity. Everyone knows the line about premature optimization by now, and coding in Go is no different.

If, however, we do have strict performance requirements or otherwise identify a bottleneck in a program, the concepts and tools introduced here will hopefully be a useful starting point for making the necessary optimizations.

If you want to play around with the simple code examples in this post, check out the source and README on GitHub.

**[Jimeux/go-samples/allocationsUnderstand the differences between the stack and the heap in Go.](https://github.com/Jimeux/go-samples/tree/master/allocations?source=post_page-----9a2631b5035d---------------------------------------)**[  
github.com](https://github.com/Jimeux/go-samples/tree/master/allocations?source=post_page-----9a2631b5035d---------------------------------------)

# **References**

*   [Frequently Asked Questions (FAQ) | golang.org](https://golang.org/doc/faq#stack_or_heap)

*   [Go’s hidden #pragmas |](https://dave.cheney.net/2018/01/08/gos-hidden-pragmas) [dave.cheney.net](https://dave.cheney.net/)

*   [Command trace | golang.org](https://golang.org/cmd/trace/)

*   [Garbage Collection in Go Series | Arden Labs](https://www.ardanlabs.com/blog/2018/12/garbage-collection-in-go-part1-semantics.html)

*   [Understanding Allocations: the Stack and the Heap | YouTube](https://www.youtube.com/watch?v=ZMZpH4yT7M0)

_Cover image by_ _[Hassan Yahaya](https://www.zikoko.com/life/12-toys-every-nigerian-boy-growing-up-in-the-90s-desperately-wanted/attachment/pile-of-lego-block-bricks-on-green-baseplate-royalty-free-image-1585754550/)_

[Go](https://medium.com/tag/go?source=post_page-----9a2631b5035d---------------------------------------)

[Golang](https://medium.com/tag/golang?source=post_page-----9a2631b5035d---------------------------------------)

[Stack](https://medium.com/tag/stack?source=post_page-----9a2631b5035d---------------------------------------)

[Heap](https://medium.com/tag/heap?source=post_page-----9a2631b5035d---------------------------------------)

[Allocations](https://medium.com/tag/allocations?source=post_page-----9a2631b5035d---------------------------------------)

1.8K  
6

[![](https://miro.medium.com/v2/resize:fill:48:48/1*AVjNsQM-wtoxqFQPkdmeIA.png)](https://miro.medium.com/v2/resize:fill:48:48/1*AVjNsQM-wtoxqFQPkdmeIA.png)

## **Published in Pairs Engineering**

[747 followers](https://medium.com/eureka-engineering/followers?source=post_page---post_publication_info--9a2631b5035d---------------------------------------)

·[Last published Jul 28, 2025](https://medium.com/eureka-engineering/how-to-dependabot-31900d6da0d1?source=post_page---post_publication_info--9a2631b5035d---------------------------------------)

Learn about Pairs’ engineering efforts, product developments and more.

Follow

[![](https://miro.medium.com/v2/resize:fill:48:48/1*nj2L9683L_c4gAiJ6fBunQ.jpeg)](https://miro.medium.com/v2/resize:fill:48:48/1*nj2L9683L_c4gAiJ6fBunQ.jpeg)

## **Written by James Kirk**

[220 followers](https://medium.com/@jimeux/followers?source=post_page---post_author_info--9a2631b5035d---------------------------------------)

·[20 following](https://medium.com/@jimeux/following?source=post_page---post_author_info--9a2631b5035d---------------------------------------)

Back-end engineer and gopher at Eureka.

Follow

# **Responses (6)**

[![](https://miro.medium.com/v2/resize:fill:32:32/1*dmbNkD5D-u45r44go_cf0g.png)](https://miro.medium.com/v2/resize:fill:32:32/1*dmbNkD5D-u45r44go_cf0g.png)

Write a response

[What are your thoughts?](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2Feureka-engineering%2Funderstanding-allocations-in-go-stack-heap-memory-9a2631b5035d&source=---post_responses--9a2631b5035d---------------------respond_sidebar------------------)

Cancel

Respond

[![](https://miro.medium.com/v2/resize:fill:32:32/0*vV31tYzGqxwlU-Ph)](https://miro.medium.com/v2/resize:fill:32:32/0*vV31tYzGqxwlU-Ph)

[Santiago Cerón](https://medium.com/@santiceron023?source=post_page---post_responses--9a2631b5035d----0-----------------------------------)

[Sep 8, 2022](https://medium.com/@santiceron023/amazing-explanation-thanks-5bd5baa995d5?source=post_page---post_responses--9a2631b5035d----0-----------------------------------)

`Amazing explanation! Thanks!!!`

9

Reply

[![](https://miro.medium.com/v2/resize:fill:32:32/0*xDBdyNCGGQhbU9cM.jpg)](https://miro.medium.com/v2/resize:fill:32:32/0*xDBdyNCGGQhbU9cM.jpg)

[Andrew Phillips](https://medium.com/@andrewphillips?source=post_page---post_responses--9a2631b5035d----1-----------------------------------)

[Jun 13, 2023](https://medium.com/@andrewphillips/this-is-a-really-good-article-unlike-most-you-see-on-this-site-64aab6b531db?source=post_page---post_responses--9a2631b5035d----1-----------------------------------)

`This is a really good article, unlike most you see on this site. There is a slight error halfway through where you say "stackIt2 passes the address of y up the stack" where I think you mean "res" not "y".Also "If it doesn’t do this, we’ll get a nil…more`

12

1 reply

Reply

[![](https://miro.medium.com/v2/resize:fill:32:32/0*8raZ7s6kdgE_rWH-)](https://miro.medium.com/v2/resize:fill:32:32/0*8raZ7s6kdgE_rWH-)

[Dallin Collins](https://medium.com/@dallin.collins?source=post_page---post_responses--9a2631b5035d----2-----------------------------------)

[Feb 18](https://medium.com/@dallin.collins/excellent-article-thank-you-8ea997abf1f9?source=post_page---post_responses--9a2631b5035d----2-----------------------------------)

`Excellent article, thank you!`

Reply

See all responses

# **More from James Kirk and Pairs Engineering**

[![](https://miro.medium.com/v2/resize:fit:679/1*fNNjmYjbWiPjsOogoR256g.jpeg)](https://miro.medium.com/v2/resize:fit:679/1*fNNjmYjbWiPjsOogoR256g.jpeg)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*AVjNsQM-wtoxqFQPkdmeIA.png)](https://miro.medium.com/v2/resize:fill:20:20/1*AVjNsQM-wtoxqFQPkdmeIA.png)

In

[Pairs Engineering](https://medium.com/eureka-engineering?source=post_page---author_recirc--9a2631b5035d----0---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

by

[James Kirk](https://medium.com/@jimeux?source=post_page---author_recirc--9a2631b5035d----0---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

**[A look at iterators in GoA look at the motivation for iterators in Go, and the current state of the related proposals and implementations.](https://medium.com/eureka-engineering/a-look-at-iterators-in-go-f8e86062937c?source=post_page---author_recirc--9a2631b5035d----0---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)**

Dec 5, 2023

[5044](https://medium.com/eureka-engineering/a-look-at-iterators-in-go-f8e86062937c?source=post_page---author_recirc--9a2631b5035d----0---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

[![](https://miro.medium.com/v2/resize:fit:679/1*yyOJQmY5VMmjogbH5LUuLw.jpeg)](https://miro.medium.com/v2/resize:fit:679/1*yyOJQmY5VMmjogbH5LUuLw.jpeg)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*AVjNsQM-wtoxqFQPkdmeIA.png)](https://miro.medium.com/v2/resize:fill:20:20/1*AVjNsQM-wtoxqFQPkdmeIA.png)

In

[Pairs Engineering](https://medium.com/eureka-engineering?source=post_page---author_recirc--9a2631b5035d----1---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

by

[Mizuki Kobayashi](https://medium.com/@mizkino?source=post_page---author_recirc--9a2631b5035d----1---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

**[BigqueryでUNNESTを使いこなせ！クエリ効率１００%！！最強！！この記事は eureka Advent Calendar 2019 ６日目の記事です。](https://medium.com/eureka-engineering/bigquery-unnest-100percent-3d28560b4f0?source=post_page---author_recirc--9a2631b5035d----1---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)**

Dec 6, 2019

[230](https://medium.com/eureka-engineering/bigquery-unnest-100percent-3d28560b4f0?source=post_page---author_recirc--9a2631b5035d----1---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

[![](https://miro.medium.com/v2/resize:fit:679/1*If8tfHS0cGq1LrvurFz7Cw.png)](https://miro.medium.com/v2/resize:fit:679/1*If8tfHS0cGq1LrvurFz7Cw.png)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*AVjNsQM-wtoxqFQPkdmeIA.png)](https://miro.medium.com/v2/resize:fill:20:20/1*AVjNsQM-wtoxqFQPkdmeIA.png)

In

[Pairs Engineering](https://medium.com/eureka-engineering?source=post_page---author_recirc--9a2631b5035d----2---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

by

[Jon Mulligan](https://medium.com/@jon.mulligan?source=post_page---author_recirc--9a2631b5035d----2---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

**[Image Processing with WebGLNative applications have set a high standard for image editing. Follow along as we try to replicate the same great experience using WebGL!](https://medium.com/eureka-engineering/image-processing-with-webgl-c2af552e8df0?source=post_page---author_recirc--9a2631b5035d----2---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)**

Dec 10, 2021

[1082](https://medium.com/eureka-engineering/image-processing-with-webgl-c2af552e8df0?source=post_page---author_recirc--9a2631b5035d----2---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

[![](https://miro.medium.com/v2/resize:fit:679/1*E_bSzx_F9yAlboQD5Ph-_A.jpeg)](https://miro.medium.com/v2/resize:fit:679/1*E_bSzx_F9yAlboQD5Ph-_A.jpeg)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*AVjNsQM-wtoxqFQPkdmeIA.png)](https://miro.medium.com/v2/resize:fill:20:20/1*AVjNsQM-wtoxqFQPkdmeIA.png)

In

[Pairs Engineering](https://medium.com/eureka-engineering?source=post_page---author_recirc--9a2631b5035d----3---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

by

[James Kirk](https://medium.com/@jimeux?source=post_page---author_recirc--9a2631b5035d----3---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

**[Abstracting database/sql boilerplate with Go genericsExploring what can be achieved using Go generics with no added dependencies](https://medium.com/eureka-engineering/abstracting-database-sql-boilerplate-with-go-generics-1471d969beed?source=post_page---author_recirc--9a2631b5035d----3---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)**

Dec 10, 2022

[2172](https://medium.com/eureka-engineering/abstracting-database-sql-boilerplate-with-go-generics-1471d969beed?source=post_page---author_recirc--9a2631b5035d----3---------------------a749d812_e8cb_486e_98d9_58c815d62109--------------)

[See all from James Kirk](https://medium.com/@jimeux?source=post_page---author_recirc--9a2631b5035d---------------------------------------)

[See all from Pairs Engineering](https://medium.com/eureka-engineering?source=post_page---author_recirc--9a2631b5035d---------------------------------------)

# **Recommended from Medium**

[![](https://miro.medium.com/v2/resize:fit:679/1*hYhItUZHlFnuknctXA6VIg.png)](https://miro.medium.com/v2/resize:fit:679/1*hYhItUZHlFnuknctXA6VIg.png)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*HA8ghEFXudXdP8JsrsKujQ.png)](https://miro.medium.com/v2/resize:fill:20:20/1*HA8ghEFXudXdP8JsrsKujQ.png)

[CodeSculptorX](https://medium.com/@codesculpturersh?source=post_page---read_next_recirc--9a2631b5035d----0---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

**[10 Brutal Reasons Why Top Tech Companies Are Ditching Go (Golang)Go was once the golden child of backend engineering. But now, from Meta to Stripe, teams are quietly rewriting Go services in Rust, Java…](https://medium.com/@codesculpturersh/10-brutal-reasons-why-top-tech-companies-are-ditching-go-golang-b46684da13e5?source=post_page---read_next_recirc--9a2631b5035d----0---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)**

Jul 24

[561](https://medium.com/@codesculpturersh/10-brutal-reasons-why-top-tech-companies-are-ditching-go-golang-b46684da13e5?source=post_page---read_next_recirc--9a2631b5035d----0---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

[![](https://miro.medium.com/v2/resize:fit:679/0*e9dWCHUXn8pv6jFF)](https://miro.medium.com/v2/resize:fit:679/0*e9dWCHUXn8pv6jFF)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*AY1HcCsAp3npKXq-TbokEA.jpeg)](https://miro.medium.com/v2/resize:fill:20:20/1*AY1HcCsAp3npKXq-TbokEA.jpeg)

[Observability Guy](https://medium.com/@observabilityguy?source=post_page---read_next_recirc--9a2631b5035d----1---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

**[Top 10 Must-Have Go Libraries for Faster DevelopmentGo (Golang) has become a favorite among developers for its simplicity, concurrency features, and performance. But what truly accelerates Go…](https://medium.com/@observabilityguy/top-10-must-have-go-libraries-for-faster-development-56d65cbd7398?source=post_page---read_next_recirc--9a2631b5035d----1---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)**

Jul 21

[35](https://medium.com/@observabilityguy/top-10-must-have-go-libraries-for-faster-development-56d65cbd7398?source=post_page---read_next_recirc--9a2631b5035d----1---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

[![](https://miro.medium.com/v2/resize:fit:679/0*xrsXirqZDbQoFyyL)](https://miro.medium.com/v2/resize:fit:679/0*xrsXirqZDbQoFyyL)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*gtUs6vT2-COr5KN1JmuObw.png)](https://miro.medium.com/v2/resize:fill:20:20/1*gtUs6vT2-COr5KN1JmuObw.png)

In

[Zepto TechXPress](https://medium.com/zepto-test?source=post_page---read_next_recirc--9a2631b5035d----0---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

by

[Akash Agarwal](https://medium.com/@akashagarwal_58535?source=post_page---read_next_recirc--9a2631b5035d----0---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

**[Go Performance Tuning at Scale: Zepto’s pprof Journey (Part 1At Zepto, we deal with some of the most demanding applications at mouth watering scale. We are tasked with keeping our customers happy…](https://medium.com/zepto-test/go-performance-tuning-at-scale-zeptos-pprof-journey-part-1-459c32780ac6?source=post_page---read_next_recirc--9a2631b5035d----0---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)**

Jul 9

[1011](https://medium.com/zepto-test/go-performance-tuning-at-scale-zeptos-pprof-journey-part-1-459c32780ac6?source=post_page---read_next_recirc--9a2631b5035d----0---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

[![](https://miro.medium.com/v2/resize:fit:679/1*nzHaGaezd3CUvfjvLC5H_Q.png)](https://miro.medium.com/v2/resize:fit:679/1*nzHaGaezd3CUvfjvLC5H_Q.png)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*Bgu5e7ov_e261sIHt3RBfg.jpeg)](https://miro.medium.com/v2/resize:fill:20:20/1*Bgu5e7ov_e261sIHt3RBfg.jpeg)

[Renaldi Purwanto](https://medium.com/@renaldid?source=post_page---read_next_recirc--9a2631b5035d----1---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

**[No Frameworks in Golang? Here’s Why It’s Actually a Great Idea!Discover how Go’s native features enable you to build powerful applications with minimal dependencies, reducing complexity and improving…](https://medium.com/@renaldid/no-frameworks-in-golang-heres-why-it-s-actually-a-great-idea-16a19b16ef7e?source=post_page---read_next_recirc--9a2631b5035d----1---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)**

Jul 25

[61](https://medium.com/@renaldid/no-frameworks-in-golang-heres-why-it-s-actually-a-great-idea-16a19b16ef7e?source=post_page---read_next_recirc--9a2631b5035d----1---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

[![](https://miro.medium.com/v2/resize:fit:679/1*ieqigNaWOsB02j0ul3Eubw.png)](https://miro.medium.com/v2/resize:fit:679/1*ieqigNaWOsB02j0ul3Eubw.png)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*ExQ1G32qNrn__fhgVrItSA.png)](https://miro.medium.com/v2/resize:fill:20:20/1*ExQ1G32qNrn__fhgVrItSA.png)

[Siddharth Narayan](https://medium.com/@siddharthnarayan?source=post_page---read_next_recirc--9a2631b5035d----2---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

**[Debugging Memory Leaks in Go Using pprof and Flame GraphsMemory leaks in Go are rare due to garbage collection, but they can still occur due to lingering references, unbounded data structures, or…](https://medium.com/@siddharthnarayan/debugging-memory-leaks-in-go-using-pprof-and-flame-graphs-f60ef9b8944d?source=post_page---read_next_recirc--9a2631b5035d----2---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)**

Apr 18

[52](https://medium.com/@siddharthnarayan/debugging-memory-leaks-in-go-using-pprof-and-flame-graphs-f60ef9b8944d?source=post_page---read_next_recirc--9a2631b5035d----2---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

[![](https://miro.medium.com/v2/resize:fit:679/0*OuWqMD8NRhSxOcjI)](https://miro.medium.com/v2/resize:fit:679/0*OuWqMD8NRhSxOcjI)

[![](https://miro.medium.com/v2/resize:fill:20:20/1*zOC3wtd1eNSIIQdXyu2i8A.jpeg)](https://miro.medium.com/v2/resize:fill:20:20/1*zOC3wtd1eNSIIQdXyu2i8A.jpeg)

[Harishsingh](https://medium.com/@harishsingh8529?source=post_page---read_next_recirc--9a2631b5035d----3---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

**[Senior Go Developers Swear by This Architecture , Here’s Why You Should TooWhen you’re scaling a Go project beyond a few hundred lines of code, architectural decisions start to matter. Bad ones create tightly…](https://medium.com/@harishsingh8529/senior-go-developers-swear-by-this-architecture-heres-why-you-should-too-94b1b3adbc1b?source=post_page---read_next_recirc--9a2631b5035d----3---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)**

Jul 19

[822](https://medium.com/@harishsingh8529/senior-go-developers-swear-by-this-architecture-heres-why-you-should-too-94b1b3adbc1b?source=post_page---read_next_recirc--9a2631b5035d----3---------------------7a91df40_9eef_438a_bdc9_96707f07f378--------------)

[See more recommendations](https://medium.com/?source=post_page---read_next_recirc--9a2631b5035d---------------------------------------)

[Help](https://help.medium.com/hc/en-us?source=post_page-----9a2631b5035d---------------------------------------)

[Status](https://medium.statuspage.io/?source=post_page-----9a2631b5035d---------------------------------------)

[About](https://medium.com/about?autoplay=1&source=post_page-----9a2631b5035d---------------------------------------)

[Careers](https://medium.com/jobs-at-medium/work-at-medium-959d1a85284e?source=post_page-----9a2631b5035d---------------------------------------)

[Press](mailto:pressinquiries@medium.com)

[Blog](https://blog.medium.com/?source=post_page-----9a2631b5035d---------------------------------------)

[Privacy](https://policy.medium.com/medium-privacy-policy-f03bf92035c9?source=post_page-----9a2631b5035d---------------------------------------)

[Rules](https://policy.medium.com/medium-rules-30e5502c4eb4?source=post_page-----9a2631b5035d---------------------------------------)

[Terms](https://policy.medium.com/medium-terms-of-service-9db0094a1e0f?source=post_page-----9a2631b5035d---------------------------------------)

[Text to speech](https://speechify.com/medium?source=post_page-----9a2631b5035d---------------------------------------)

**1%**

**Taskify Tabs**

Search

[Write](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2Fnew-story&source=---top_nav_layout_nav-----------------------new_post_topnav------------------)

Sign up

[Sign in](https://medium.com/m/signin?operation=login&redirect=https%3A%2F%2Fmedium.com%2F%40ankur_anand%2Fa-visual-guide-to-golang-memory-allocator-from-ground-up-e132258453ed&source=post_page---top_nav_layout_nav-----------------------global_nav------------------)

[![](https://miro.medium.com/v2/resize:fill:32:32/1*dmbNkD5D-u45r44go_cf0g.png)](https://miro.medium.com/v2/resize:fill:32:32/1*dmbNkD5D-u45r44go_cf0g.png)

Top highlight  
1  
1

# **A visual guide to Go Memory Allocator from scratch (Golang)**

[![](https://miro.medium.com/v2/resize:fill:32:32/1*DsmXrZxd1k-4EedPT5D3pg.jpeg)](https://miro.medium.com/v2/resize:fill:32:32/1*DsmXrZxd1k-4EedPT5D3pg.jpeg)

[Ankur Anand](https://medium.com/@ankur_anand?source=post_page---byline--e132258453ed---------------------------------------)

Follow

11 min read

·

Feb 20, 2019

2.9K

11

When I first started trying to understand the memory allocator of Go, it was maddening. Everything seemed like a mystical black box. As almost every technical wizardry is hidden beneath abstractions, you need to peel off those layers one by one to understand it.

In this blog post, we will exactly do that. Do you want to learn everything about Go memory allocator? You’re reading the right article.

Translated by readers into: [Russian](https://habr.com/ru/company/ruvds/blog/442648/), [Chinese](https://www.linuxzen.com/go-memory-allocator-visual-guide.html).

# **Physical and Virtual Memory**

Every Memory Allocator needs to work with the Virtual Memory Space that is managed by the underlying Operating System. Let’s see how it works.

[![](https://miro.medium.com/v2/resize:fit:420/1*FS11mGLFn7uyeSlJq15K6g.png)](https://miro.medium.com/v2/resize:fit:420/1*FS11mGLFn7uyeSlJq15K6g.png)

A simple illustration of a Physical Memory Cell (Not an exact representation)

**A greatly simplified overview of a single memory cell:**

1.  Address line (transistor as a switch) is what provides access to the capacitor (Data to Data lines).

2.  When the Address line has current flowing (shown as red), the data line may write to the capacitor, so the capacitor is charged, and the logical value stored is “1”.

3.  When the Address line has no current flowing (shown as green), the data line may not write to the capacitor, so the capacitor is uncharged, and the logical value stored is “0”.

4.  When the CPU needs to “READ” a value from RAM, an electric current is sent along the “ADDRESS LINE” (closing the switch). If the capacitor is holding a charge, the current flows down the “DATA LINE” (value of 1); otherwise no current flows down the DATA LINE, so the capacitor stays uncharged (value of 0).

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*4Zygvzn9hwFc3NCg8uWUYQ.png)](https://miro.medium.com/v2/resize:fit:700/1*4Zygvzn9hwFc3NCg8uWUYQ.png)

Simple Illustration of how a Physical Memory Cell interacts with CPU

**Data Bus:** Transports data between CPU and Physical Memory.

Let’s also talk a little bit about **Address line** and **Addressable bytes.**

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*ry7d7jMPW5_GzyPPmHubgA.png)](https://miro.medium.com/v2/resize:fit:700/1*ry7d7jMPW5_GzyPPmHubgA.png)

Illustrative Representation of an Address Line between CPU and Physical Memory.

1\. Each “BYTE” in DRAM is assigned a unique numeric identifier (address).

**“Physical bytes present != Number of address line”.** (_e.g. 16bit intel 8088, PAE_)

2\. Each “Address line can send 1-bit value, so it specifies a “SINGLE

BIT” in the address of a given byte.

3\. In our Diagram, we have a **32** address line. So each addressable **BYTE** gets “32 bit” as an address.

`[ 00000000000000000000000000000000 ] — low memory address.[ 11111111111111111111111111111111 ] — high memory address.`

4\. Since we have a 32-bit address for each byte, so our address space consists of ²³² addressable bytes (4 GB) (in the above Illustrative representation).

So the addressable bytes depends upon the total address line, so for 64 address line (x86–64 CPUs) ²⁶⁴ bytes of addressable bytes (16 exabytes), but most architectures that use 64-bit pointers actually use 48-bit address lines (AMD64) and 42-bit address lines (Intel) theoretically allowing 256 terabytes of physical RAM ( Linux allows 128TB of address space per process on x86–64 `[with 4 level page tables](https://www.kernel.org/doc/Documentation/x86/x86_64/mm.txt)`, windows 192TB)

As the size of physical RAM is limited, so Each Process runs in its own memory sandbox — “virtual address space,” known as **Virtual Memory.**

**Address of a byte in this virtual address space is no longer the same as the address that the processor places on the address bus**. So, the translation data structures and a system have to be established to map a byte in the virtual address space to a physical byte.

How does this virtual address look like?

Zoom image will be displayedVirtual Address Space Representation

[![](https://miro.medium.com/v2/resize:fit:1000/1*ImbY2Tb3wZaeuKblwarFTg.jpeg)](https://miro.medium.com/v2/resize:fit:1000/1*ImbY2Tb3wZaeuKblwarFTg.jpeg)

So when the CPU executes an instruction that refers to a memory address. The first step is translating that logic address in the VMA into a **linear address.** This translation is done by **MMU**.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*xek5BQhJhWqsOPAaA5uROw.png)](https://miro.medium.com/v2/resize:fit:700/1*xek5BQhJhWqsOPAaA5uROw.png)

This is **not** a physical diagram, only a depiction. address translation process not included for simplicity

Since this logical address is too large to be practically (depends upon various factor) managed individually, these are managed in term of **pages.** When the necessary paging constructs have been activated, the **virtual memory space is divided into smaller regions called pages (**4kB on most OS can be changed**).** It is the smallest unit of data for memory management in virtual memory. Virtual memory doesn’t store anything, it simply _maps_ a program’s address space onto the underlying physical memory.

Individual Process only sees this VMA as their Address. **So what happens when our program request for more “heap memory”.**

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*Un3ffseQYt_y3vzObgMqfg.png)](https://miro.medium.com/v2/resize:fit:700/1*Un3ffseQYt_y3vzObgMqfg.png)

A simple assembly code asking for more heap memory.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*mvi6PRy9wu0KmBcP9YT5Cw.png)](https://miro.medium.com/v2/resize:fit:700/1*mvi6PRy9wu0KmBcP9YT5Cw.png)

heap memory increment

Program asks for more memory. via the `[brk](http://www.kernel.org/doc/man-pages/online/pages/man2/brk.2.html)` ( `sbrk`/`mmap` etc) system call.

The kernel updates merely the heap VMA and calls it good.

# No page frames are actually allocated at this point and the new pages are not present in physical memory. Point of difference between VSZ vs RSS Size.

# **Memory Allocator**

With the basic overview of “Virtual Address Space”, and what it means to increase the heap, the memory allocator becomes easier to reason now.

> If there is enough space in the heap to satisfy a memory request from our code, Memory allocator can fulfill the request without kernel involvement, else it enlarges heap via a system (brk) call, usually requesting a large block of memory. (For malloc large mean > MMAP\_THRESHOLD bytes -128 kB by default).

However, memory allocator has more responsibility than merely updating the `brk address`. One of the major being how to **reduce** both `internal`and fragmentation`external` and how **fast** it can allocate this block**.** Consider the request of a contiguous memory block from our program using a function `malloc(size)` and releasing that memory back using a function `free(pointer)` in a sequential way from p1 to p4.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*xeMzyUdfZe9HBQABl2t9Og.png)](https://miro.medium.com/v2/resize:fit:700/1*xeMzyUdfZe9HBQABl2t9Og.png)

An external fragmentation demonstration

At p4 step even though we have enough memory block we cannot fulfill the request for 6 contiguous blocks of memory resulting in memory fragmentation.

**So how do we reduce the memory fragment?** The answer to this question depends on the specific memory allocation algorithm, the underlying library use.

We will be looking into an overview of TCMalloc a memory allocator on which closely the Go memory allocator is modeled.

# **TCMalloc**

The core idea of [TCMalloc (thread cache malloc)](http://goog-perftools.sourceforge.net/doc/tcmalloc.html) is to divide the memory into multiple levels to reduce the granularity of the lock. Inside TCMalloc Memory management is divided into two parts: **thread memory** and **page heap**.

## **thread memory**

Each memory page divided into — Free List of multiple fixed allocatable size-classes, which helps in reducing **fragmentation**. So each thread will have a cache for small objects without locks, which makes it very efficient to allocate small objects (<=32k) under parallel programs.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*L6MpddL2RZY-kmguKL29jw.png)](https://miro.medium.com/v2/resize:fit:700/1*L6MpddL2RZY-kmguKL29jw.png)

Thread Cache (Each Thread gets this Thread Local Thread Cache)

## **page heap**

The heap managed by TCMalloc consists of a collection of pages, **where a set of consecutive pages can be represented by span**. When allocated Object is larger than 32K, Pages Heap is used for allocation.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*WBLW_v9sLqFMwNdn_DZ9AA.png)](https://miro.medium.com/v2/resize:fit:700/1*WBLW_v9sLqFMwNdn_DZ9AA.png)

Page Heap (for span management)

When there is not enough memory to allocate small objects, go to page heap for memory. If there is not enough, page heap will ask more memory from the Operating System.

As such an allocation model maintains a user-spaced memory pool, it greatly improves the efficiency of memory allocation and release.

> Note: Even though go memory allocator was originally based on tcmalloc, but has diverged quite a bit.

# **Go Memory Allocator**

We Know Go Runtime schedules **Goroutines** (**G**) onto **Logical Processors** (**P**) for execution. Likewise, TCMalloc Go also divides Memory Pages into a block of **67** different classes Size.

> If you’re not familiar with the Go scheduler you can get an overview (Go scheduler: Ms, Ps & Gs), till then I will wait for you over here.

[![](https://miro.medium.com/v2/resize:fit:476/1*dWZLGb3sJWncTdEFVuhxzw.png)](https://miro.medium.com/v2/resize:fit:476/1*dWZLGb3sJWncTdEFVuhxzw.png)

Size Classes in Go

As Go manages pages at the granularity of **8192B** if this page is divided into a block size of **1kB** we get a total of 8 such blocks within that page for example.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*wF9KuVSk8o-16N64kB11UA.png)](https://miro.medium.com/v2/resize:fit:700/1*wF9KuVSk8o-16N64kB11UA.png)

8 KB page divided into a size class of 1KB (In Go pages are maintained at the granularity of 8KB)

These run’s of pages in Go is also managed through a structure known as **mspan**.

_The size classes and page count(run of pages gets chopped into objects of the given size) that gets allocated to each size classes are chosen so that rounding an allocation request up to the next size class wastes at most 12.5%_

## **mspan**

Simply put, it ’s a double linked list object that contains the start address of the page, span class of the page that it has, and the number of pages it contains.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*EU3BwOrCI7KIFEninr-bxA.png)](https://miro.medium.com/v2/resize:fit:700/1*EU3BwOrCI7KIFEninr-bxA.png)

Illustrative Representation of a mspan in Go memory allocator

## **mcache**

Like TCMalloc Go provides each **Logical Processors**(**P**) a Local Thread Cache of Memory known as **mcache**, so that if Goroutine needs memory it can directly get it from the **mcache** without any **locks** being involved as at any point of time only one **Goroutine** will be running on **Logical Processors**(**P**).

## Get Ankur Anand’s stories in your inbox

Join Medium for free to get updates from this writer.

Subscribe

**mcache** contains a **mspan** of all class size as a cache.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*5eLTsavMYrixqr4H99FwmA.png)](https://miro.medium.com/v2/resize:fit:700/1*5eLTsavMYrixqr4H99FwmA.png)

Illustrative Representation of a Relationship between P, mcache, and mspan in Go.

# As there is mcache Per-P, so no need to hold locks when allocating from the mcache.

For each class size, there are two types.

1.  **scan** — Object that contains a pointer.

2.  **noscan** — Object that doesn’t contains a pointer.

One benefits of this approach being while doing Garbage Collection, **noscan** object doesn’t need to be traversed to find any containing live object.

**What Goes to mcache ?.**

# Object size <=32K byte are allocated directly to mcache using the corresponding size class mspan.

**What happens When mcache has no free slot?**

A new mspan is obtained from the **mcentral** list of mspans of the required size class.

## **mcentral**

mcentral Object collects all spans of a given size class and each mcentral is two lists of mspans.

1.  **empty** mspanList — List of mspans with no free objects or .
    
    mspans that has is cached in an mcache

2.  **nonempty** mspanList — List of spans with a free object.

When a new Span is requested from mcentral, it’s taken (if available) from the `nonempty` list of mspanList. The relationship between these two lists is as follow When a new span is requested, the request is fulfilled from the non-empty list and that span is put into the empty list. When the span is freed then based on the number of free objects in the span it is put back to the non-empty list.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*_j2eG0lUdVQ8NRwgYy-DyA.png)](https://miro.medium.com/v2/resize:fit:700/1*_j2eG0lUdVQ8NRwgYy-DyA.png)

Illustrative Representation of a mcentral

Each mcentral structure is maintained inside the **mheap** structure.

## **mheap**

# mheap is the Object that manages the heap in Go, only one global. It own the virtual addresses space.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*rTsieglF6GO1NW78KN8vkQ.png)](https://miro.medium.com/v2/resize:fit:700/1*rTsieglF6GO1NW78KN8vkQ.png)

Illustrative Representation of a mheap.

As we can see from the above illustration **mheap has an array of mcentral**. This **array contains mcentral of each span class**.

```Plain
central [numSpanClasses]struct {
  	mcentral mcentral
    	pad      [sys.CacheLineSize unsafe.Sizeof(mcentral{})%sys.CacheLineSize]byte
}
```

> Since We have mcentral for each span class, when a mspan is requested by mcache from mcentral, the lock is involved at individual mcentral level, so any other mcache requesting a mspan of different size at the same time can also be served.

_Padding makes sure that the MCentrals are_ _spaced CacheLineSize bytes apart so that each MCentral.lock_ _gets its own cache line_ in order to avoid false sharing problems.

So what happens when this **mcentral** list is empty? **mcentral** obtains a run of pages from the **mheap** to use for spans of the required size class.

*   **free\[\_MaxMHeapList\]mSpanList**: This is a spanList array. The **mspan** in each spanList consists of 1 ~ 127 (\_MaxMHeapList — 1) pages. For example, free\[3\] is a linked list of **mspans** containing 3 pages. Free means free list, which is unallocated. Corresponding to the busy list.

*   **freelarge mSpanList**: A list of **mspans**. The number of pages per element (that is, mspan) is greater than 127. It’s maintained as a mtreap Data structure. Corresponding to busylarge.

# Object of Size > 32k, is a large object, allocated directly from mheap. These large request comes at an expenses of central lock, so only one P’s request can be served at any given point of time.

# **Object allocation Flow**

*   Size > 32k is a large object, allocated directly from **mheap.**

*   Size < 16B, using mcache’s tiny allocator allocation

*   Size between 16B ~ 32k, calculate the sizeClass to be used and then use the block allocation of the corresponding sizeClass in mcache

*   If the sizeClass corresponding to mcache has no available blocks, apply to mcentral.

*   If there are no blocks available for mcentral, apply to mheap and **use BestFit to find the most suitable mspan**. If the application size is exceeded, it will be divided as needed to return the number of pages the user needs. The remaining pages constitute a new mspan, and the mheap free list is returned.

*   If there is no span available for mheap, apply to the operating system for a new set of pages (at least 1MB).

# But Go allocates pages in even large size (called arena) at OS Level. Allocating a large run of pages amortizes the cost of talking to the operating system.

**All memory requested on the heap comes from the arena.** Let’s look at what this arena looks like.

# **Go Virtual Memory**

Lets us look into the memory of simple go program.

```Plain
func main() {
    for {}
}
```

[![](https://miro.medium.com/v2/resize:fit:620/1*4bePvN9LhkTkPWlRIWGgew.png)](https://miro.medium.com/v2/resize:fit:620/1*4bePvN9LhkTkPWlRIWGgew.png)

process stats for a program

So even for a simple go program virtual Space is around `~100 MB` while RSS is just `696kB` . Lets us try to figure out this difference first.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*JBeUo5u5l45-3qzEQrpJ3A.png)](https://miro.medium.com/v2/resize:fit:700/1*JBeUo5u5l45-3qzEQrpJ3A.png)

map and smap stats.

So there are regions of memory which are sized around ~`2MB, 64MB and 32MB`. What are these?

## **Arena**

It turns out the virtual memory layout in go consists of a **set** of **arenas.** The initial heap mapping is one arena i.e `64MB`(based on go 1.11.5).

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*yX9Q92T4B1aHEoQWTQI36g.png)](https://miro.medium.com/v2/resize:fit:700/1*yX9Q92T4B1aHEoQWTQI36g.png)

current incremental arena size on a different system.

So currently memory is mapped in small increments as our program needs it, and it starts with one arena (~64MB).

_Please take these number with a grain of salt. Subject to change._ Earlier `go` used to reserve a continuous virtual address upfront, on a 64-bit system the arena size was 512 GB. (what happens if allocations are large enough and are **rejected by mmap** ?)

**This set of arenas is what we call heap.** In Go, each arena is managed at a granularity of `8192 B` of pages.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*5pyhqsz3aVLyY_kRFc7Lig.png)](https://miro.medium.com/v2/resize:fit:700/1*5pyhqsz3aVLyY_kRFc7Lig.png)

Single arena ( 64 MB ).

Go also has two more blocks which **span** and **bitmap**. **Both of them are allocated off-heap and contains metadata of each arena.** It’s mostly used during Garbage Collection (so we will leave it for now).

The classes of allocation strategy in Go we’ve just discussed, only scratch the surface in the fantastic diversity of memory allocation.

However, the general idea of the Go memory management is to allocate memory using different memory structures using different cache level memory for objects of different sizes. Splitting a single block of consecutive addresses received from the operating system, into a multi-level cache improve the efficiency of memory allocation by reducing the locks and then allocating memory allocations according to the specified size reduces memory fragmentation and facilitates faster GC after the memory is released.

I am leaving you with this Visual Overview of Go Memory Allocator for now.

Zoom image will be displayed

[![](https://miro.medium.com/v2/resize:fit:700/1*T9WO7O3EWTWJjCrxaOz4cg.png)](https://miro.medium.com/v2/resize:fit:700/1*T9WO7O3EWTWJjCrxaOz4cg.png)

Visual Overview of Runtime Memory Allocator.

[![](https://miro.medium.com/v2/resize:fit:5000/1*-OQBs5b4u65NRQM8aFukAw.png)](https://miro.medium.com/v2/resize:fit:5000/1*-OQBs5b4u65NRQM8aFukAw.png)

* * *

## More Resources

*   [Original Article by James Kirk](https://medium.com/eureka-engineering/understanding-allocations-in-go-stack-heap-memory-9a2631b5035d)