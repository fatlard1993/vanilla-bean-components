# Component

> Component/Component.js

Component extends Elem with a lifecycle and reactive options. The design goal is predictability: render always produces the same result for the same options, no diffing surprises, no residual state from a previous render. The options object is an Oxject instance, so any assignment to an option property is automatically reactive; subclasses don't wire this up themselves.

## Render is destructive - no diffing, no patching

- `render()` empties the element completely before calling `build()`; there is no diff, no patch, no partial update. The element fully reflects current options state after every render
  - does calling render() twice leave exactly one copy of the built structure, not two?

## Options are a reactive Oxject instance, not a plain object

- `this.options` is an Oxject proxy; assigning to any option property triggers the reactive update cycle automatically; subclasses do not register reactive wiring manually
  - new Subject({ textContent: "before", autoRender: false }) captures c then c.render() then c.options.textContent = "after" -> c.elem.textContent === "after"

## `build()` runs before options are processed

- `build()` establishes the DOM structure before any option logic runs on it; options that depend on DOM elements being present always find those elements in place
  - new Array() captures order then new (class extends Subject { static schema = { probe: { set() { order.push("option:" + !!this.marker); } } }; build() { this.marker = true; order.push("build"); } })({ probe: 1 }) captures c -> order.join() === "build,option:true"

## Some options are processed before others

The ordering is driven by a set of priority option names -- framework base keys, plus schema keys flagged `priority: true` -- applied ahead of the rest in `processOptions`.

- an option whose correct behaviour depends on another can rely on that other having been applied first; the caller does not order them
  - new Array() captures order then new (class extends Subject { static schema = { alpha: { priority: true, set(v) { this.fromAlpha = v * 2; order.push("alpha"); } }, beta: { set() { order.push("beta:" + this.fromAlpha); } } } })({ beta: 1, alpha: 5 }) captures c -> order.join() === "alpha,beta:10"

## Cleanup prevents accumulation on re-render

- `replaceCleanup` replaces any existing cleanup registered under the same key, preventing duplicate handlers when the component re-renders; `addCleanup` chains, `replaceCleanup` replaces
  - new Array() captures ran then new Array() captures chained then new Subject({}) captures c then c.replaceCleanup("k", () => ran.push("a")) then c.replaceCleanup("k", () => ran.push("b")) then ran.join() captures atReplace then c.processCleanup() then new Subject({}) captures d then d.addCleanup("k", () => chained.push("a")) then d.addCleanup("k", () => chained.push("b")) then chained.join() captures atAdd then d.processCleanup() -> atReplace === "a" && ran.join() === "a,b" && atAdd === "" && chained.join() === "a,b"

## autoRender controls whether construction renders immediately or waits for an explicit call
- the default (`autoRender: true`) renders the component as part of construction, so callers get a fully-built element without a separate step
  - new Subject({ textContent: "hi" }) captures c -> c.rendered === true
- `autoRender: false` skips that automatic call; the component exists but stays unrendered until the caller invokes `render()` explicitly
  - new Subject({ autoRender: false, textContent: "hi" }) captures c then c.rendered captures before then c.render() -> before !== true && c.rendered === true

Between those two there are the cases where *now* is the wrong moment rather than the wrong idea. `onload` waits for the page to finish if it has not already, and `animationFrame` waits for the next frame -- both render on their own, just not during construction.

- `autoRender: 'onload'` renders immediately when the document has already loaded, rather than waiting for an event that has been and gone
  - new Subject({ autoRender: "onload", textContent: "hi" }) captures c -> document.readyState === "complete" && c.rendered === true
- `autoRender: 'animationFrame'` does not render during construction; it renders on the next frame
  - new Subject({ autoRender: "animationFrame", textContent: "hi" }) captures c then c.rendered captures duringConstruction then await new Promise(r => requestAnimationFrame(() => r())) then await new Promise(r => setTimeout(r, 20)) -> duringConstruction !== true && c.rendered === true

## `on()` reports whether it recognised the event, so callers can fall back

Option dispatch tries `on()` first for any `on*` key and needs a yes-or-no answer to decide whether the key was an event or something else entirely. Three categories are recognised -- pointer events, input events, and the synthetic connection events -- and anything outside them is declined rather than silently attached to nothing.

- pointer, input and connection events are recognised; an unrecognised name is declined, as is a registration with no callback
  - new Subject({ appendTo: document.body }) captures c then ["pointerdown", "contextmenu", "input", "change", "connected", "disconnected"].map(e => c.on({ targetEvent: e, callback: () => {} })) captures recognised then ["click", "notAnEvent"].map(e => c.on({ targetEvent: e, callback: () => {} })) captures declined -> recognised.every(Boolean) && declined.every(r => r === false) && c.on({ targetEvent: "pointerdown" }) === false

## A `data` option lives in options only, and the nearest class decides

Most options end up on the element; a `data` option is state the component reasons about, so pushing it at the DOM would either stringify it or provoke an unknown-key warning. Whether a key is data is read from the nearest class that declares it, which is what lets a subclass flatten a parent's structured option instead of inheriting the treatment.

- a `data` option stays in `options` and is not assigned to the element
  - new Array() captures probe then new (class extends Subject { static schema = { title: { data: true } }; })({ title: "hello", appendTo: document.body }) captures asData then new (class extends Subject { static schema = { title: {} }; })({ title: "hello", appendTo: document.body }) captures plain -> asData.options.title === "hello" && asData.elem.title === "" && plain.elem.title === "hello"
- the nearest class that declares the key decides, so a subclass can flip a parent's `data` flag
  - new Array() captures probe then (class extends Subject { static schema = { title: { data: true } }; }) captures Base then new Base({ title: "hello", appendTo: document.body }) captures base then new (class extends Base { static schema = { title: { data: false } }; })({ title: "hello", appendTo: document.body }) captures flipped -> base.elem.title === "" && flipped.elem.title === "hello"
