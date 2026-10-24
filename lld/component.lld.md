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

## Moving within the document is not a disconnect

A re-render re-applies `appendTo`, and appending an element to the parent it already has is a move: the DOM records it as a removal plus an addition. Disconnect cleanup is for leaving the document, so a component that never left keeps its options and handlers.

- re-rendering a component that is in the document leaves its options alive
  - new Subject({ appendTo: document.body }) captures c then c.render() then await new Promise(r => setTimeout(r, 0)) -> c.options.isDestroyed === false

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

Option dispatch tries `on()` first for any `on*` key and needs a yes-or-no answer to decide whether the key was an event or something else entirely. Three categories are recognised -- pointer events and click, input events, and the synthetic connection events -- and anything outside them is declined rather than silently attached to nothing.

- pointer, click, input and connection events are recognised; an unrecognised name is declined, as is a registration with no callback
  - new Subject({ appendTo: document.body }) captures c then ["pointerdown", "click", "contextmenu", "input", "change", "connected", "disconnected"].map(e => c.on({ targetEvent: e, callback: () => {} })) captures recognised then ["notAnEvent"].map(e => c.on({ targetEvent: e, callback: () => {} })) captures declined -> recognised.every(Boolean) && declined.every(r => r === false) && c.on({ targetEvent: "pointerdown" }) === false

## A `data` option lives in options only, and the nearest class decides

Most options end up on the element; a `data` option is state the component reasons about, so pushing it at the DOM would either stringify it or provoke an unknown-key warning. Whether a key is data is read from the nearest class that declares it, which is what lets a subclass flatten a parent's structured option instead of inheriting the treatment.

- a `data` option stays in `options` and is not assigned to the element
  - new Array() captures probe then new (class extends Subject { static schema = { title: { data: true } }; })({ title: "hello", appendTo: document.body }) captures asData then new (class extends Subject { static schema = { title: {} }; })({ title: "hello", appendTo: document.body }) captures plain -> asData.options.title === "hello" && asData.elem.title === "" && plain.elem.title === "hello"
- the nearest class that declares the key decides, so a subclass can flip a parent's `data` flag
  - new Array() captures probe then (class extends Subject { static schema = { title: { data: true } }; }) captures Base then new Base({ title: "hello", appendTo: document.body }) captures base then new (class extends Base { static schema = { title: { data: false } }; })({ title: "hello", appendTo: document.body }) captures flipped -> base.elem.title === "" && flipped.elem.title === "hello"

## A long press is not also a press

A touch screen has no right-click, so holding a pointer still is how a menu or a second action is reached. The press that became a long press must not also count as a press, or holding a card would both open its menu and open the card.

- a pointer held still fires the long press with its point, and the click that ends it doesn't press
  - new Array() captures calls then new Subject({ tag: "button", onLongPress: e => calls.push("long:" + e.clientX), onPointerPress: () => calls.push("press"), appendTo: document.body }) captures b then b.elem.dispatchEvent(new PointerEvent("pointerdown", { button: 0, clientX: 7, clientY: 7 })) then await new Promise(r => setTimeout(r, 560)) then b.elem.dispatchEvent(new PointerEvent("pointerup", { button: 0 })) then b.elem.click() -> calls.join() === "long:7"

## Pressable: a press by keyboard is the same click

Buttons, cards, calendar days and drop zones each used to answer Enter and Space their own way: on keydown or keyup, by `key` or `code`, calling the handler with a key event or not at all. A press is a click, so a keyboard press is made one: whatever hears the element's clicks hears the keyboard too.

- `pressable: true` makes an element a tab stop with the button role, and Enter and Space press it as a click
  - new Array() captures presses then new Subject({ pressable: true, onPointerPress: e => presses.push(e.type), appendTo: document.body }) captures c then c.elem.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })) then c.elem.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true })) then c.elem.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true })) -> presses.join() === "click,click" && c.elem.tabIndex === 0 && c.elem.getAttribute("role") === "button"
- a key pressed in a field inside it is the field's, not a press
  - new Array() captures presses then new Subject({ pressable: true, onPointerPress: () => presses.push(1), appendTo: document.body }) captures c then document.createElement("input") captures field then c.elem.append(field) then field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })) -> presses.length === 0
- a role the element already has is kept, and `pressable(false)` takes away what it added
  - new Subject({ role: "gridcell", pressable: true, appendTo: document.body }) captures c then c.elem.getAttribute("role") captures kept then c.pressable(false) -> kept === "gridcell" && !c.elem.hasAttribute("tabindex") && c.elem.getAttribute("role") === "gridcell"
- a `<button>` is left as it is: the browser already presses it by keyboard
  - new Subject({ tag: "button", pressable: true, appendTo: document.body }) captures b -> !b.elem.hasAttribute("role") && !b.elem.hasAttribute("tabindex")
