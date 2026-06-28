# Design Ethos

## The core position

When a framework automatically tracks what depends on what, reconciling a virtual DOM, propagating reactive signals, compiling declarative templates to imperative updates, it takes ownership of the execution path. That feels like less work. It is less work, until something goes wrong.

At that point you're debugging decisions made by machinery you can't read, inside failure modes that are subtle by design. Stale closures. Dependency cycles. Batching surprises. Re-render cascades that skip the parts you needed to update and touch the parts you didn't. The complexity didn't go away; it moved somewhere harder to reach.

VBC is built on the opposite premise: **explicit execution paths are better than automatic ones**. When data changes, you decide what updates. That decision lives in `_setOption`, code you write, can read, and can trace. The DOM is stateful; this library accepts that and works with it directly rather than pretending otherwise.

---

## Direct DOM manipulation over reconciliation

A re-render cycle, whether blind or diff-based, does work you didn't ask for to approximate what you already know. If `user.name` changed, you know the name element needs updating. A reconciler has to rediscover that. You don't. `_setOption` is the dependency declaration: when this option changes, run this code. That's the whole model.

The practical consequence: VBC's failure mode is obvious. You forget to handle a key in `_setOption` and the UI doesn't update. You see that immediately. The UI is wrong in an obvious way. Compare this to the failure modes of automatic systems: the UI updates, but to the wrong value, because a closure captured stale state, or a computed dependency didn't invalidate, or a batch ran in a different order than expected. Those failures hide.

---

## Readable over performant

Optimize when you've identified the need, not as a default posture. Frameworks that attempt to optimize everything all the time sacrifice transparency. When requirements change (and they always do), you or someone else will read and modify that code. Readable code changes safely. Optimized-by-default code hides the meaning of what it's doing. Hidden meaning breaks when requirements shift.

This doesn't mean performance doesn't matter. It means performance is a specific problem solved with specific solutions when it's identified, not an ambient concern baked into every abstraction.

---

## JavaScript-first, not markup-first

A component has three concerns: structure, style, behavior. Markup languages describe structure well. They describe behavior poorly, which is why every markup-first approach ends up embedding scripting anyway. Once you're scripting, JavaScript is already the right medium. It can describe structure too, without the impedance mismatch.

VBC components are plain JavaScript classes. Build structure in `build()`. Handle state in `_setOption()`. Style with `styled()`. The three concerns are distinct; the language is unified. Any complex requirement will require scripting. Starting in JavaScript means you're already there.

---

## Scoped styles without ShadowDOM

Scoped styles are essential to component architecture. ShadowDOM provides encapsulation but creates friction: style piercing is verbose, third-party DOM integration becomes awkward, global theme tokens require workarounds. VBC achieves the same encapsulation without those costs: styles are wrapped in a generated scope class and injected as a `<style>` tag, using native CSS nesting for selectors. The DOM stays flat and inspectable; global styles still work where needed. Native CSS nesting is supported in the target browsers (Chrome 112+, Firefox 117+, Safari 16.5+) without a build step.

---

## Locality of behavior

The mental model for a component should be self-contained. Logic, styles, and documentation live alongside the implementation, not scattered across separate directories by concern. Sub-components are nested within the parents that use them. CSS is colocated with the component it styles.

This is the [Locality of Behavior](https://htmx.org/essays/locality-of-behaviour/) principle applied to components: the behavior of a thing should be obvious from looking at that thing. Scattering behavior across files, directories, and configuration layers makes code harder to read and harder to change correctly.

---

## Simple over complex

The goal is to reduce the size and complexity of the code that runs invisibly. Any framework code deemed necessary should be readable on its own, small enough in scope that when something breaks, you can follow the execution path to where it broke.

This is the [complexity demon](https://grugbrain.dev/) problem. Complexity accumulates. Every abstraction layer added to remove one kind of friction adds another kind of friction in its place. The question isn't "does this abstraction save work now?" It's "does this abstraction make the system easier to understand and change over time?"

VBC's answer to most framework abstractions is: the execution path they hide is one you should own. The work they save is work you benefit from understanding.

The explicit model's cost doesn't accumulate inside individual components. It accumulates when many components share the same operation shape. When five entity types all need rendering, labeling, selection, and edit-boundary behavior, the explicit model doesn't consolidate that for you. That consolidation is your responsibility: entity registries, dispatch tables, whatever the domain calls for. VBC won't impose a pattern. Nothing stops you from finding one when the repetition earns it.

The repetition is always visible, always extractable, and always obviously yours to fix. That is a better problem to have than invisible complexity in a layer you don't own.

There is also a distinction worth naming: solving a problem and making something safe for any developer are different engineering targets. The second is legitimate when your users are diverse and the cost of misuse is high. But it produces different code: defensive defaults, forgiving APIs, guardrails at every boundary, edge case handling for hundreds of disconnected use cases. That code is written for a recipient who doesn't fully understand the tool.

When the user is a capable intelligence who understands the domain and will read what they're building on, the defensive surface is overhead without benefit. Strategy and opinion aren't liabilities to design around. They're what makes a tool precise. An opinionated tool that solves the specific problem well serves the right user better than a general-purpose one padded against misuse by any user.

---

## On ownership

You can only trust a library as far as you can read it.

Most libraries optimize for distribution and convenience. They minify, compile, abstract. The source you can examine is not the source that runs. When something breaks at the edges, you're debugging a projection of the thing, not the thing itself.

VBC is designed to be owned. The source is readable JavaScript following consistent patterns. No compiled output, no runtime that diverges from what you read. When your requirements eventually reach the primitive layer, not just building on top but needing the foundation to behave differently, the fork is viable.

Code you can fork is code you can trust.

The common response: full ownership isn't realistic. You can't read everything you depend on. As a description of most codebases, that's accurate. As a constraint of nature, it isn't.

The architecture that requires accumulating unreadable things is the architecture that failed to draw clear lines. When each piece has one responsibility and a contract you can state plainly, the pieces stay small enough to own. The total system can be large. Each node stays legible. The accumulation isn't imposed on you; you chose not to draw the lines.

This changes the question you ask when evaluating any abstraction. Not "is this useful?" Nearly everything is useful. **Is this earnable?** Can I read it when I need to? Can I trace the path when it breaks at the edge? Does absorbing its complexity cost more than writing without it?

Useful is the lease evaluation. Earnable is the ownership evaluation. They produce different decisions.

The accumulation has a second problem: it compounds. Unclear lines create coupling. Coupling becomes unnavigable without annotation. Annotation creates confidence you haven't earned. Confidence enables more coupling. The lines get blurrier. Adding type coverage to an accumulated pile doesn't break the loop. It makes the loop more comfortable to stay inside.

---

## On SSR

Server-side rendering is not a goal of this library.

SSR addresses a specific cluster of problems: public content that needs to be indexed before JavaScript executes, initial paint performance for anonymous users on slow devices, Open Graph metadata for social sharing. These are real problems, for web sites. Marketing pages, blogs, e-commerce storefronts, content-heavy public interfaces.

VBC targets the web app space: authenticated interfaces, stateful interactive tools, applications that a user opens, uses, and returns to. In this context the SSR concerns largely dissolve. Content behind authentication isn't indexed by search engines. Social sharing metadata doesn't apply to a dashboard or a field management panel. Initial paint matters less when the user is already invested in a session.

Building SSR support into a client-side component library that targets app interfaces would mean adding significant architectural complexity, hydration protocols, server-side async resolution, style extraction pipelines, to solve problems that don't exist in the target context. That is the wrong trade.

---

## On AI-authored code

The "magic" layer in modern frameworks, VDOM reconciliation, automatic dependency tracking, compiled reactivity, was invented for human developers. Humans struggle to track state transitions across a large codebase, so frameworks say: describe the desired state, we'll figure out what changed. That accommodation made sense when humans wrote all the code.

As AI writes more of the code, the accommodation becomes unnecessary overhead. An AI writing `_setOption` for every data key in a component isn't doing something hard. It's doing something mechanical and exhaustive, without the cognitive limits the magic layer was designed to compensate for. The framework's automatic tracking is solving a problem the AI doesn't have. And those same cognitive limits, the ones that made automatic tracking feel necessary, are the limits that make verification hard. Remove the accommodation, and its opacity disappears with it.

The explicit model is easier to verify. When a human reviews AI-generated code in an automatic system, they have to trust that the AI correctly understood what the framework will do invisibly: that the dependency array is right, that the signal invalidates correctly, that the effect timing is correct. In an explicit system, you read the handler and you know. The execution path is visible. The audit is cheap.

**As AI handles more of the generation work, the architecture that is easiest to verify becomes the fastest architecture, not despite its verbosity but because of it.**

Verbosity in an explicit model is not cost. It is information. Each handler declared, each subscriber wired, each update path named is a line a reviewer can read and confirm. The verification is proportional to the number of explicit statements, not to inferring what the framework will do automatically. When AI generates the explicit code and a human reviews it, the feedback loop, generate, review, correct, ship, runs fastest on the architecture that minimizes review cost.

With AI generating code, write-time approaches zero. What remains is read-time. The explicit model wins that dimension.

The frameworks that won the last era won by being easy for humans to write. The explicit model wins the current era by being fast to verify. The magic layer was always a human accommodation for the cost of writing. It is aging accordingly.

There is a deeper version of this argument. Type annotations and documentation exist to help a developer use code they haven't fully read, a map of the surface when you can't hold the territory. That function is real when a codebase is too large, too compiled, or too abstract to hold in working memory.

An AI holding a succinct, well-designed codebase in full context doesn't need the map. It has the territory. It can reason about actual behavior, trace edge cases, understand design intent, from the source directly, not from the shape the types describe. The shadow is useful precisely when you can't hold the light source. When you can, the shadow adds nothing.

This changes what a large general-purpose library is, as a category. Those libraries accumulated edge cases for every possible consumer because any developer, at any level of understanding, might reach for them. The generality was the cost of broad distribution. If the intelligence is now at the generation layer, applied specifically to your use case, reasoning from your actual requirements, you don't need the generality. The idiot-proofing concern moves layers.

This is the JIT moment for the layer above the code. JIT didn't just speed programs up. It moved the optimization concern to the runtime, freeing developers to write readable code without paying the performance cost. The concern that made libraries fat is moving to the AI layer. The libraries that stay small, coherent, and explicit can be held whole and reasoned about directly. The ones that accumulated generality for every edge case a human consumer might hit are carrying weight for a problem the new layer solves better.

---

## On JavaScript and TypeScript

TypeScript is a compensation mechanism. Compensation mechanisms solve real problems. But naming this one correctly matters for understanding what VBC is doing and why.

The problem TypeScript compensates for: code too large, too abstract, or too implicit to be understood directly. When a library's API surface is too large to hold in working memory, type annotations surface the shape at the call site. When a codebase grows beyond what anyone can fully read, types provide contracts at boundaries. The compensation is real and has value.

But it addresses a symptom, not the cause. The cause is a clarity problem. Types make that problem livable. They don't fix it.

A developer who reads `subscribe()` knows the cleanup semantics, knows what happens on a destroyed context, knows what `current` means in the return. A developer who relies on the type signature knows the shape of the arguments. These are different depths of knowledge, and only the first survives a change to the code it describes.

What happened is that types became table stakes not because they're the right solution but because they were the best available solution. The industry adapted around them. IDEs got better at surfacing type information. Libraries competed on the quality of their declarations. Developers learned to navigate through types rather than through source. The scaffold became load-bearing: "good library" came to mean "well-typed library," which came to mean "library you can use without reading." The underlying clarity problem remained unaddressed.

VBC doesn't accept that trade. The source is the interface. The demo, the interactive option editor, the JSDoc-sourced API docs: these are tooling. Different tooling. Tooling that treats understanding as the goal, not type-checking as a substitute for understanding. A developer who runs `bun start` and explores a component with live options learns what it does, not just what it accepts.

This isn't specific to AI. It's epistemological. A human who reads `_setOption` knows how `onPointerPress` is intentionally method-routed, why handlers on a parent class are shadowed rather than composed, when a key falls through to the elem. A human navigating through IDE tooling knows the type signature. The same depth that makes AI generation reliable is what makes a human contributor effective. The industry provided IDE tooling as the best available approach to navigating complex code. Developers got used to it. Neither of those things makes it the right epistemology; they make it the incumbent one.

This commitment has costs worth being direct about. The proxy-based Oxject state container, where the constructor returns a Proxy and `instanceof Oxject` is always false, is correct, elegant JavaScript. TypeScript cannot describe a constructor that returns a different type than the class being constructed without significant workarounds. The `_setOption` routing cascade works because JavaScript property lookup and prototype chain traversal are runtime operations the type system has no way to verify. These designs aren't accidents; they are the shapes that JavaScript's dynamic nature naturally affords. Committing to TypeScript would mean bending them toward typability rather than keeping them correct.

When type annotations serve a purpose, IDE and bundler compatibility, they can be generated from source. That is how VBC approaches this: a minimal declaration file is generated from source on every build as a compatibility layer, not hand-maintained as a constraint. The source is ground truth. What cannot be recovered from source is expressive power already traded away to satisfy the type checker.

This library is JavaScript. Not TypeScript that compiles to JavaScript. Not TypeScript without the `.ts` extension. JavaScript, the actual language, with its actual dynamic capabilities. That is a design commitment, not a limitation.

---

## On the choice

The conditions for this were created. Attention markets reward library authors for coverage and edge-case handling, not clarity. Framework adoption gets celebrated; source literacy goes unmentioned. Hiring filters for familiarity with the tool, not understanding of what it does. The accumulation was incentivized, and the incentives were consistent.

That is context. It is not absolution.

There are React developers considered experts in their field who have never read a line of React source. They can recite the rules, when effects fire, what the dependency array controls, how the reconciler decides what to re-render, without knowing what actually executes when they call `useState`. Expert operators of something they cannot own. The industry ratified that as expertise.

The source has always been there. The decision to reach for the dependency instead of understanding the problem was a choice. The decision to navigate through type annotations instead of reading the code was a trade. The comfort of the framework's magic over knowledge of the execution path was a preference, made, whether consciously or not, every time.

This does not require unusual discipline or special circumstance. The time spent reading source pays back faster than the time spent debugging what you didn't read. The choice is available.
