# Elem

> lld/helpers/elem.js

A lightweight DOM wrapper that gives options a defined dispatch order. The wrapper itself is invisible — callers interact with standard DOM properties and the library's own API through the same options object, without needing to know which layer handles each key. The wrapper is stable: an Elem always points at the same underlying node.

## Option dispatch has a fixed precedence: Elem API → DOM properties → attributes

**method:** `getIdProperty`

- Elem's own methods are checked first; known DOM properties like `id` are assigned as element properties; unknown keys fall through to direct property assignment
  - getIdProperty("test-id") → "test-id"

## One wrapper, one node — the reference never changes

**method:** `elemRefStable`

- each Elem wraps exactly one DOM element, set at construction and never replaced
- code that holds an Elem reference always points at the same underlying node, regardless of how the content is updated
  - elemRefStable() → true

## Elem children unwrap automatically

**method:** `appendElemChild`

- when an Elem instance is passed as a child of another Elem, it is unwrapped to its underlying HTMLElement automatically; no explicit unwrapping needed at the call site
  - appendElemChild("div", "span") → "span"
