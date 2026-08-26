# Label

> ./Label.js

Labeling wrapper with five structural variants. The key decision is that `variant` selects a DOM structure, not just a CSS class; each variant builds a different composition of elements suited to its use case.

## Each variant applies a distinct class that drives its CSS behavior

**browser:** true

- 'collapsible', 'overlay', 'inline', 'inline-after', and 'simple' each apply their own class to the component element; swapping `variant` changes the class and the structural CSS rules that attach to it
  - new Subject({ variant: "collapsible", label: "Section", appendTo: document.body }, Object.assign(document.createElement("div"), { id: "lld-content", textContent: "wrapped" })) captures l then l.elem.querySelector("label") captures lab then l.elem.querySelector("#lld-content") captures content then getComputedStyle(content).display captures atFirst then lab.click() then await new Promise(r => setTimeout(r, 80)) then getComputedStyle(content).display captures afterClick then lab.click() then await new Promise(r => setTimeout(r, 80)) -> getComputedStyle(lab).cursor === "pointer" && atFirst !== "none" && afterClick === "none" && getComputedStyle(content).display === atFirst

## Collapsed state is externally controllable, not just toggle-driven

- `collapsed: true` sets the initial collapsed state; assigning to it later expands or collapses programmatically without simulating user interaction
  - does setting collapsed: true hide the wrapped content?
  - does setting collapsed: false after construction show the previously hidden content?

## Overlay label visibility is driven by CSS pseudo-class, not JavaScript

**browser:** true

- the overlay variant's label visibility responds to whether the input has content via the `:placeholder-shown` pseudo-class; the component adds the structural class and the CSS handles the rest
  - new Subject({ variant: "overlay", label: "Name", appendTo: document.body }, Object.assign(document.createElement("input"), { placeholder: "type here" })) captures l then await new Promise(r => setTimeout(r, 700)) then l.elem.querySelector("label") captures lab then getComputedStyle(lab).transform captures whileEmpty then l.elem.querySelector("input").value = "filled" then await new Promise(r => setTimeout(r, 700)) -> whileEmpty !== "matrix(1, 0, 0, 1, 0, 0)" && getComputedStyle(lab).transform === "matrix(1, 0, 0, 1, 0, 0)"

## The variant decides which side the label text sits on, and moving it is a move

`inline-after` is the only variant that puts the text after the control, so switching variants has to relocate the existing text node rather than render a second one. Reassigning a variant is a reposition, not a rebuild.

- the label text precedes the control except under `inline-after`, and changing variant moves the same text rather than adding another
  - new Subject({ label: "Name", variant: "inline", appendTo: document.body, append: document.createElement("input") }) captures l then Array.from(l.elem.children).indexOf(l._labelText.elem) captures asInline then l.options.variant = "inline-after" then Array.from(l.elem.children).indexOf(l._labelText.elem) captures asAfter then l.options.variant = "inline" -> asInline === 0 && asAfter === 1 && Array.from(l.elem.children).indexOf(l._labelText.elem) === 0 && l.elem.children.length === 2

## A collapsible label reports its own expanded state

The label text is what a reader activates to open and close the section, so it is the element that has to carry `aria-expanded` -- and it has to stay in step with the `collapsed` option rather than being set once at construction.

- a collapsible label starts expanded and follows the `collapsed` option
  - new Subject({ label: "Sect", variant: "collapsible", appendTo: document.body }) captures l then l._labelText.elem.getAttribute("aria-expanded") captures atStart then l.options.collapsed = true -> atStart === "true" && l._labelText.elem.getAttribute("aria-expanded") === "false" && l.hasClass("collapsed")
- becoming collapsible is what adds the state; a label that is not collapsible does not claim one
  - new Subject({ label: "Sect", variant: "inline", appendTo: document.body }) captures l then l._labelText.elem.getAttribute("aria-expanded") captures asInline then l.options.variant = "collapsible" -> asInline === null && l._labelText.elem.getAttribute("aria-expanded") === "true"

## The label is text or a full set of options, and `for` takes whatever identifies the control

A label is usually a string, and stays that short. When it needs more it carries the label element's own options instead. `for` is the same idea applied to the target: a string id when the caller has one, and otherwise the control itself -- as a component or as an element -- with the label assigning an id if the control has none, because an association that silently fails is indistinguishable from a label that was never wired.

- a string `label` becomes the text; an object is used as the label element's options
  - new Subject({ label: "Str", appendTo: document.body }) captures s then new Subject({ label: { textContent: "Obj", addClass: "fancy" }, appendTo: document.body }) captures o -> s._labelText.elem.textContent === "Str" && o._labelText.elem.textContent === "Obj" && o._labelText.elem.classList.contains("fancy")
- `for` accepts an id string, a component, or an element, and gives an unidentified control an id so the association actually holds
  - new Subject({ label: "L", for: "explicit", appendTo: document.body }) captures byString then new Subject({ tag: "input" }) captures control then document.body.append(control.elem) then new Subject({ label: "L", for: control, appendTo: document.body }) captures byComponent -> byString._labelText.elem.htmlFor === "explicit" && control.elem.id.length > 0 && byComponent._labelText.elem.htmlFor === control.elem.id
