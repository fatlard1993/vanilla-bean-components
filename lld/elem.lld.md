# Elem

> Elem/Elem.js

A lightweight DOM wrapper that gives options a defined dispatch order. The wrapper itself is invisible: callers interact with standard DOM properties and the library's own API through the same options object, without needing to know which layer handles each key. The wrapper is stable: an Elem always points at the same underlying node.

## Option dispatch has a fixed precedence: Elem API → DOM properties → attributes

- Elem's own methods are checked first; known DOM properties like `id` are assigned as element properties; unknown keys fall through to direct property assignment
  - does constructing an Elem with an `id` option set the underlying element's `id` property to that value?

## One wrapper, one node - the reference never changes

Code holding an Elem reference therefore always points at the same underlying node, however the content is updated.

- each Elem wraps exactly one DOM element, set at construction and never replaced
  - new Subject({ tag: "div" }) captures e then e.elem captures ref then e.append(new Subject({ tag: "span" })) then e.content("replaced") then e.empty() -> e.elem === ref

## Elem children unwrap automatically

- when an Elem instance is passed as a child of another Elem, it is unwrapped to its underlying HTMLElement automatically; no explicit unwrapping needed at the call site
  - new Subject({ tag: "span" }) captures child then new Subject({ tag: "div" }, child) captures parent -> parent.elem.children[0] === child.elem && parent.elem.children[0] instanceof HTMLElement

## Setters ignore what they cannot use and always return the element

Every setter returns the element so calls chain, and that contract cannot depend on the argument being well-formed -- a chain that breaks in the middle on a null is worse than one that quietly does nothing. `setStyle` therefore takes only a plain object of property names: a string, an array or a number is not a style declaration, and a numeric key is an artifact of something being spread rather than a property anyone meant to set.

- `setStyle` ignores anything that is not a plain object, leaving existing styles untouched, and still returns the element
  - new Subject({ tag: "div", style: { color: "red" } }) captures e then [null, "color: blue", ["color", "blue"], 7].map(bad => e.setStyle(bad) === e) captures chained -> chained.every(Boolean) && e.elem.style.color === "red"
- a numeric key in a style object is skipped while the real properties beside it still apply
  - new Subject({ tag: "div" }) captures e then e.setStyle({ 0: "nope", fontSize: "9px" }) -> e.elem.style.fontSize === "9px" && !String(e.elem.getAttribute("style")).includes("nope")
- an insertion with no parent is a no-op that still returns the element, so an optional parent needs no guard at the call site
  - new Subject({ tag: "div" }) captures e -> e.prependTo(undefined) === e && e.appendTo(undefined) === e

## An element knows what it is and where it sits

Debug output and parent traversal both need an answer that does not depend on the caller holding a reference: the element identifies itself by name, and reports both its DOM parent and the wrapper that owns it.

- an element identifies itself as an Elem when stringified
  - new Subject({ tag: "div" }) captures e -> String(e) === "[object Elem]"
- an appended element reports its DOM parent, and the wrapper that owns that parent
  - new Subject({ tag: "section" }) captures parent then new Subject({ tag: "span", appendTo: parent }) captures child -> child.parentElem.tagName === "SECTION" && child.parent === parent
