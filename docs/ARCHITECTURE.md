# Architecture

## Overview

vanilla-bean-components is a reactive UI component library built on vanilla JavaScript. Components are plain ES classes that wrap HTMLElements, driven by a proxy-based reactive state container (`Oxject`, from the `@vanilla-bean/oxject` npm package) that automatically propagates property changes to the DOM. There is no virtual DOM, no JSX, and no build step required for consumers; direct DOM manipulation is the intentional design.

---

## The Three-Layer Stack

```
EventTarget  (browser built-in)
    └── Elem
            Creates and wraps an HTMLElement. Provides DOM helpers
            (append, addClass, setStyle, etc.) and a synchronous
            _setOption() router. Options are a plain object;
            no reactivity at this layer.
        └── Component
                Replaces the plain options object with an Oxject
                instance. Adds the render lifecycle (build/render/empty),
                keyed cleanup system, event registration (on/emit),
                styled CSS injection, and autoRender timing.
            └── UI Components
                    (Button, Input, Dialog, Select, ...)
                    Override build() to create sub-structure,
                    define static handlers for custom option keys,
                    and define domain-specific behavior.
```

### What each layer adds

| Layer | Adds |
| --- | --- |
| `EventTarget` | `addEventListener`, `removeEventListener`, `dispatchEvent` |
| `Elem` | `this.elem` (HTMLElement), synchronous `_setOption`, DOM helpers (`addClass`, `append`, `setStyle`, `setAttributes`, `content`, `appendTo`, `prependTo`, `prepend`) |
| `Component` | `this.options` as a reactive `Oxject`, render lifecycle (`render` / `build` / `empty`), keyed cleanup (`addCleanup` / `replaceCleanup` / `processCleanup`), destroy-only cleanup (`replaceDestroyCleanup`), event routing (`on` / `emit`), `autoRender` timing, connection observation, scoped style injection |

---

## Reactivity Model

### Oxject: external reactive state

`Component.options` is an instance of `Oxject` from the `@vanilla-bean/oxject` npm package. `Oxject` is a proxy-based reactive object: every property assignment dispatches events that the component listens to. It is not defined inside this repository.

In `Component`, the constructor creates `this.options` as a `new Oxject(...)` and immediately listens to its `'set'` event:

```js
this.options = new Oxject({
	...optionsWithoutConfig,
	addClass: [this.uniqueId, optionsWithoutConfig.addClass],
	append: [optionsWithoutConfig.append, children],
});

const setOption = ({ detail: { key, value } }) => {
	if (this.rendered) this._setOption(key, value);
};

this.options.addEventListener('set', setOption);
```

The guard `if (this.rendered)` is critical: reactive updates only flow through `_setOption` **after the initial render completes**. During the initial render, `_processOptions()` iterates all options directly.

---

## Render Lifecycle

### The sequence

```
render()
  │
  ├─ if (this.rendered)        <- only on re-render
  │     empty()                  clears children, runs descendant cleanup
  │     this.rendered = false
  │
  ├─ build()                   <- subclass structural hook (no-op in base)
  │
  ├─ _processOptions()         <- routes every option through _setOption()
  │     priority keys first (onConnected, textContent, content,
  │     appendTo, prependTo, value)
  │     then all remaining keys
  │
  └─ this.rendered = true
       this.onRendered?.()     <- called after every successful render
```

If `build()` or `_processOptions()` throws, `processCleanup()` is called before rethrowing, preventing resource leaks from partial renders.

### build() is the subclass hook

`build()` is a no-op in the base `Component`. Subclasses override it to create child elements and internal structure. Because `build()` runs before `_processOptions()`, all structure exists by the time `_setOption` receives option values.

```js
class Card extends Component {
	build() {
		this.header = new Component({ tag: 'header', appendTo: this });
		this.body = new Component({ tag: 'section', appendTo: this });
	}

	static handlers = {
		title(value, next) {
			this.header.options.textContent = value;
			// does not call next() -- fully owns this key
		},
	};
}
```

**Never override `render()`** in a subclass. `render()` is the public re-render API; its contract is stable and subclasses must not change it.

**Deep hierarchies must chain manually.** `build()` does not call `super.build()` automatically. If class `C` extends `B` extends `Component`, and both `B` and `C` define `build()`, `C.build()` must explicitly call `super.build()` to preserve the parent's structure.

**`async build()` is not supported.** `render()` does not `await` the return value of `build()`. Asynchronous initialization must be done outside the render lifecycle (e.g., in `onConnected`).

### empty() only runs on re-render

`empty()` is gated by `if (this.rendered)`. On the very first render it is skipped entirely. On subsequent calls to `render()` it removes all child elements and runs `processCleanup` on all descendant components before clearing the DOM.

---

## Option Processing Pipeline

`_setOption(key, value)` is the single routing function for all option changes, both during initial render and on reactive updates.

### Step 1: static handlers chain

Before standard routing, `_setOption` walks the constructor prototype chain from the most-derived class up to (but not including) `Component`, collecting any `static handlers` object that owns a handler for the given key. Handlers are ordered deepest-class-first.

```js
// Example: a subclass claims 'title'
class MyComponent extends Component {
	static handlers = {
		title(value, next) {
			this.titleElem.options.textContent = value;
			// Call next(value?) to continue to the next handler or standard routing.
			// Omit next() to fully own the key and stop processing.
		},
	};
}
```

Each handler receives `(value, next)`. Calling `next(optionalValue)` passes control to the next handler in the chain; when the chain is exhausted `next` falls through to standard routing. If no handlers claim the key, standard routing runs directly.

### Step 2: standard routing

```
1. key === 'onRendered'
      -> store as this.onRendered (called after every render)

2. key starts with 'on' AND value is truthy
      -> this.on({ targetEvent, id: key, callback: value })
         Handles: pointer events, input events, connection events,
                  registered custom events.
         Returns true if recognized.
         If not recognized and no matching method, warns in dev and returns.

3. key === 'uniqueId'
      -> this.elem.id = value (or this.uniqueId as fallback)

4. key === 'style'
      -> this.setStyle(value)

5. key === 'attributes'
      -> this.setAttributes(value)

6. key is in knownAttributes OR starts with 'aria-' OR starts with 'data-'
      -> elem.setAttribute(key, value) / removeAttribute on null/undefined/false
         boolean true -> setAttribute with empty string

7. typeof this[key] === 'function' AND key not in _lifecycleMethods
      -> this[key].call(this, value)
         (e.g., addClass, append, styles, onHover, onPointerPress)

8. this.hasOwnProperty(key) AND key not in _internalProperties
      -> this[key] = value   (own data properties)

9. typeof this.elem[key] === 'function'
      -> this.elem[key].call(this.elem, value)

10. typeof value === 'function'
      -> this[key] = value   (store function as component property)

11. default
      -> this.elem[key] = value   (direct HTMLElement property)
         (warns in dev if key is not a known elem property)
```

Lifecycle method names (`render`, `destroy`, `build`, `empty`, `processCleanup`, `addCleanup`, `replaceCleanup`) are blocked at step 7 and never called through options.

---

## Styling Pipeline

Styles can be scoped at class definition time (via `styled()`) or per-instance (via the `styles` option or method). There is no PostCSS processing, no autoprefixer, and no nested selector expansion. Styles are plain CSS strings wrapped with a scope selector and injected as-is via a `<style>` tag in `document.head`.

### styled() -- class-level scoped CSS

```
styled(BaseComponent, stylesFn, options?)
    │
    ├─ classSafeNanoid()         generates unique componentId
    │
    ├─ shimCSS({ scope: '.componentId', styles: stylesFn })
    │     if document loaded -> themeStyles(config) -> appendStyles(css)
    │     else -> push to loadQueue, register single 'load' listener
    │           on load -> process all queued configs -> appendStyles each
    │
    └─ configured(BaseComponent, { addClass: [componentId], ...options })
          returns extended class whose constructor merges componentId into addClass
```

`styled()` also supports a tagged template literal syntax:

```js
const StyledButton = styled(Button)`
	color: red;
	font-size: 1rem;
`;
```

All `styled()` calls that happen before `window load` are batched into a single queue and flushed together on the `load` event.

### themeStyles -- scope wrapping

`themeStyles({ styles, scope })` calls `styles(theme)` to produce a CSS string, then wraps all non-keyframe content in `scope { ... }`. `@keyframes` blocks are extracted and placed outside the scope wrapper. The result is a plain CSS string. No preprocessing occurs.

### appendStyles -- injection

`appendStyles(css, id)` creates a `<style>` element in `document.head` with `style.textContent = css`. If `id` is provided and a `<style id="...">` already exists, its `textContent` is updated in place rather than creating a duplicate element.

### Per-instance styles (Component.styles method)

```
this.styles(value)
    │
    ├─ object -> this.setStyle(value)   (inline style properties)
    │
    └─ string or function
          -> themeStyles({ styles: value, scope: '.uniqueId' })
                calls value(theme) if function, wraps result in scope selector
          -> appendStyles(css, this.uniqueId)
                creates <style id="uniqueId"> in document.head
                (or updates existing element if id already present)
```

Cleanup removes the `<style>` element by ID when the component is destroyed or the styles option is replaced.

---

## Connection Lifecycle

`observeElementConnection` uses a single shared `MutationObserver` that watches the entire `document` subtree. Each registration adds a target to a module-level `Map`; mutations are fanned out to all matching targets. When the last registration is removed the observer is disconnected and the singleton is cleared.

```js
observeElementConnection({
	target: this.elem,
	onConnected: event => this.emit('connected', event),
	onDisconnected: event => this.emit('disconnected', event),
});
```

The observer is lazy, created only when the first `onConnected` or `onDisconnected` handler is registered via `on()`. The returned handle's `disconnect()` method removes the target from the registry.

Connection events emit on the Component's own `EventTarget` (not on `this.elem`), so listeners added via `component.addEventListener('connected', fn)` receive them. `emit()` also re-dispatches on `this.elem` so that standard DOM listeners on the element fire as well.

---

## Cleanup System

Two cleanup tiers exist, with different lifetimes.

### this.cleanup -- disconnect tier

```js
this.cleanup = {};   // plain object, keys are string IDs

addCleanup(id, fn)
    // Chains with existing cleanup[id] if present (both run).
    // Initializes the system and registers the 'disconnected' listener
    // on first call.

replaceCleanup(id, fn)
    // Runs existing cleanup[id] immediately, then stores new fn.
    // Used for rebindable resources (event handlers in loops).

processCleanup(cleanup?, rootCleanup?)
    // Snapshots Object.values(cleanup), deletes all keys, runs all fns.
    // rootCleanup=true -> recursively collects and cleans child components first.
    // Called automatically on 'disconnected' event.
```

Cleanup in `this.cleanup` runs every time the component disconnects from the DOM, not only on destroy. Use this tier for subscriptions and listeners that should be re-established on the next connection.

### this.\_destroyCleanup -- destroy tier

`replaceDestroyCleanup(id, fn)` stores cleanup in `this._destroyCleanup`. This cleanup does **not** run on disconnect. It runs only when `destroy()` is called explicitly.

Use this tier for element-level event listeners that must survive temporary DOM moves (e.g. pointer events registered by `on()`, `onHover`, `onPointerPress`).

### destroy()

`destroy()` runs both tiers in order:

1. Disconnects `this.elemObserver` and all descendant `elemObserver` instances.
2. Calls `processCleanup(this.cleanup, true)` -- runs disconnect-tier cleanup for this component and all descendants.
3. Calls `processCleanup(this._destroyCleanup)` -- runs destroy-tier cleanup.
4. Removes `this.elem` from the DOM.

### Key design

The key-per-resource design allows targeted replacement (`replaceCleanup`) without accumulating stale closures. Both objects are plain dictionaries; the snapshot-then-delete pattern in `processCleanup` prevents re-entrant cleanup from running the same function twice.

---

## Module Dependency Graph

```
browser APIs (EventTarget, MutationObserver, document, requestAnimationFrame)
    │
    ├── Elem/Elem.js
    │       └── utils/buildClassList
    │
    ├── @vanilla-bean/oxject          (external npm package)
    │       Oxject -- proxy-based reactive object used as this.options
    │
    ├── styled/
    │       ├── styled.js          -> shimCSS, configured, classSafeNanoid, theme
    │       ├── shimCSS.js         -> themeStyles, appendStyles
    │       ├── themeStyles.js     -> theme, utils/string
    │       └── appendStyles.js    (no internal deps)
    │
    └── Component/Component.js
            ├── Elem/Elem.js
            ├── @vanilla-bean/oxject
            ├── styled/ (appendStyles, themeStyles)
            ├── Component/observeElementConnection.js
            └── utils/classSafeNanoid

UI Components (Button, Input, Dialog, ...)
    └── Component/Component.js   (directly or through wrapper components)
```

No circular dependencies exist in this graph.
