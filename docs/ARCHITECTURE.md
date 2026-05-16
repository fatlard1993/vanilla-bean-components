# Architecture

## Overview

vanilla-bean-components is a reactive UI component library built on vanilla JavaScript. Components are plain ES classes that wrap HTMLElements, driven by a proxy-based reactive state container (Context) that automatically propagates property changes to the DOM. There is no virtual DOM, no JSX, and no build step required for consumers — direct DOM manipulation is the intentional design.

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
                Replaces the plain options object with a Context
                instance. Adds the render lifecycle (build/render/empty),
                keyed cleanup system, event registration (on/emit),
                styled CSS injection, and autoRender timing.
            └── UI Components
                    (Button, Input, Dialog, Select, …)
                    Override build() to create sub-structure,
                    extend _setOption() for custom option keys,
                    and define domain-specific behavior.
```

### What each layer adds

| Layer | Adds |
| --- | --- |
| `EventTarget` | `addEventListener`, `removeEventListener`, `dispatchEvent` |
| `Elem` | `this.elem` (HTMLElement), synchronous `_setOption`, DOM helpers (`addClass`, `append`, `setStyle`, `setAttributes`, `content`, `appendTo`, `prependTo`, `prepend`) |
| `Component` | `this.options` as a reactive `Context`, render lifecycle (`render` / `build` / `empty`), keyed cleanup (`addCleanup` / `replaceCleanup` / `processCleanup`), event routing (`on` / `emit`), `autoRender` timing, connection observation, scoped style injection |

---

## Reactivity Model

### Context: proxy-returns-from-constructor

`Context` extends `EventTarget`. Its constructor returns a `Proxy` — not `this`. Every caller receives the proxy as the object reference.

```js
// Context constructor (simplified)
constructor(initialState) {
    super();
    this.target = { ...initialState };
    this.proxy = new Proxy(this.target, {
        get(target, key) {
            // contextKeys (methods like subscriber, subscribe, destroy)
            // are redirected to the Context instance.
            // All other keys read from target directly.
        },
        set(target, key, value) {
            Reflect.set(target, key, value);
            context.onSet(key, value);   // emits 'set' + '<key>' events
        },
    });
    return this.proxy; // <-- caller gets the proxy, not the Context instance
}
```

Every property assignment on a Context fires two CustomEvents:

- `'set'` — `{ detail: { key, value } }` — generic catch-all
- `'<key>'` — `{ detail: value }` — property-specific

### Component.options is a Context

In `Component`, the constructor creates `this.options` as a `new Context(...)` and immediately listens to its `'set'` event:

```js
this.options = new Context({ ...optionsWithoutConfig, ... });

const setOption = ({ detail: { key, value } }) => {
    if (this.rendered) this._setOption(key, value);
};

this.options.addEventListener('set', setOption);
```

The guard `if (this.rendered)` is critical: reactive updates only flow through `_setOption` **after the initial render completes**. During the initial render, `_processOptions()` iterates all options directly.

### Subscribers

`Context.subscriber(key, parser)` returns a `Subscriber` object. When a `Subscriber` is passed as a value in another Context's initial state, Context wires up the subscription automatically at construction time — changes to the source property propagate to the consuming Context's property.

```js
const state = new Context({ count: 0 });

const display = new Component({
	// subscriber updates textContent whenever state.count changes
	textContent: state.subscriber('count', n => `Count: ${n}`),
});
```

---

## Render Lifecycle

### The sequence

```
render()
  │
  ├─ if (this.rendered)        ← only on re-render
  │     empty()                  clears children, runs descendant cleanup
  │     this.rendered = false
  │
  ├─ build()                   ← subclass structural hook (no-op in base)
  │
  ├─ _processOptions()         ← routes every option through _setOption()
  │     priority keys first (onConnected, textContent, content,
  │     appendTo, prependTo, value)
  │     then all remaining keys
  │
  └─ this.rendered = true
```

### build() is the subclass hook

`build()` is a no-op in the base `Component`. Subclasses override it to create child elements and internal structure. Because `build()` runs before `_processOptions()`, all structure exists by the time `_setOption` receives option values.

```js
class Card extends Component {
	build() {
		this.header = new Component({ tag: 'header', appendTo: this });
		this.body = new Component({ tag: 'section', appendTo: this });
	}

	_setOption(key, value) {
		if (key === 'title') {
			this.header.options.textContent = value;
		} else {
			super._setOption(key, value);
		}
	}
}
```

**Never override `render()`** in a subclass. `render()` is the public re-render API; its contract is stable and subclasses must not change it.

**Deep hierarchies must chain manually.** `build()` does not call `super.build()` automatically. If class `C` extends `B` extends `Component`, and both `B` and `C` define `build()`, `C.build()` must explicitly call `super.build()` to preserve the parent's structure.

**`async build()` is not supported.** `render()` does not `await` the return value of `build()`. Asynchronous initialization must be done outside the render lifecycle (e.g., in `onConnected`).

### empty() only runs on re-render

`empty()` is gated by `if (this.rendered)`. On the very first render it is skipped entirely. On subsequent calls to `render()` it removes all child elements and runs `processCleanup` on all descendant components before clearing the DOM.

---

## Option Processing Pipeline

`_setOption(key, value)` is the single routing function for all option changes, both during initial render and on reactive updates. Priority order:

```
1. key starts with 'on' AND value is truthy
      → this.on({ targetEvent, id: key, callback: value })
        Handles: pointer events, input events, connection events,
                 registered custom events.
        Returns true if recognized; falls through if not.

2. key === 'uniqueId'
      → this.elem.id = value (or this.uniqueId as fallback)

3. key === 'style'
      → this.setStyle(value)

4. key === 'attributes'
      → this.setAttributes(value)

5. key === 'augmentedUI'
      → elem.setAttribute / removeAttribute 'data-augmented-ui'

6. key is in knownAttributes OR starts with 'aria-'
      → elem.setAttribute(key, value) / removeAttribute on null/false

7. typeof this[key] === 'function' AND key not in _lifecycleMethods
      → this[key].call(this, value)
        (e.g., addClass, append, styles, onHover, onPointerPress)

8. this.hasOwnProperty(key) AND key not in _internalProperties
      → this[key] = value   (own data properties)

9. typeof this.elem[key] === 'function'
      → this.elem[key].call(this.elem, value)

10. typeof value === 'function'
      → this[key] = value   (store function as component property)

11. default
      → this.elem[key] = value   (direct HTMLElement property)
```

Lifecycle method names (`render`, `destroy`, `build`, `empty`, `processCleanup`, `addCleanup`, `replaceCleanup`) are blocked at step 7 and never called through options.

---

## Styling Pipeline

Styles can be scoped at class definition time (via `styled()`) or per-instance (via the `styles` option or method).

### styled() — class-level scoped CSS

```
styled(BaseComponent, themeFn)
    │
    ├─ classSafeNanoid()         generates unique componentId
    │
    ├─ shimCSS({ scope: '.componentId', styles: themeFn })
    │     ├─ if document loaded → postCSS(themeStyles(config)).then(appendStyles)
    │     └─ else → push to onLoadStyleQueue, register single 'load' listener
    │           on load → batch process all queued configs → appendStyles each
    │
    └─ configured(BaseComponent, { addClass: [componentId] })
          returns extended class whose constructor merges componentId into addClass
```

All `styled()` calls that happen before `window load` are batched into a single queue and processed together in one PostCSS run, avoiding repeated style injection during startup.

### Per-instance styles (Component.styles method)

```
this.styles(value)
    │
    ├─ object → this.setStyle(value)   (inline style properties)
    │
    └─ string or function
          → themeStyles({ styles: value, scope: '.uniqueId' })
                calls value(theme) if function, prefixes all selectors with scope
          → postCSS(themedCSS)
                autoprefixer + postcss-nested → flat CSS string
          → appendStyles(css, this.uniqueId)
                creates <style id="uniqueId"> in document.head
                (or updates existing element if id already present)
```

Cleanup removes the `<style>` element by ID when the component is destroyed or the styles option is replaced.

### PostCSS plugins

| Plugin           | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `postcss-nested` | Expands nested selectors (`&:hover { }`, child combinators) |
| `autoprefixer`   | Adds vendor prefixes for browser compatibility              |

---

## Connection Lifecycle

`observeElementConnection` creates a `MutationObserver` watching a fixed parent node for the target element being added or removed from its subtree.

```js
observeElementConnection({
	parent: this.parentElem || document, // fixed at creation, never re-anchors
	target: this.elem,
	onConnected: event => this.emit('connected', event),
	onDisconnected: event => this.emit('disconnected', event),
});
```

The observer is lazy — created only when the first `onConnected` or `onDisconnected` handler is registered via `on()`.

**Explicit constraint: the parent scope is fixed at initialization and never updates.** If the component is moved to a different parent after the observer is created, connection events will stop firing. This is not a bug; it is a known limitation of the implementation. Components that need reliable reconnection detection after re-parenting must call `this.elemObserver?.disconnect()` and re-trigger observer setup.

Connection events emit on the Component's own `EventTarget` (not on `this.elem`), so listeners added via `component.addEventListener('connected', fn)` receive them.

---

## Cleanup System

Two distinct cleanup mechanisms exist in the codebase, with different designs.

### Component — keyed object cleanup

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
    // rootCleanup=true → recursively collects and cleans child components first.
    // Called automatically on 'disconnected' event.
```

The key-per-resource design allows targeted replacement (`replaceCleanup`) without accumulating stale closures.

### Context — CleanupManager (array-based)

`CleanupManager` is an array of `{ fn, id }` entries. `add(fn, id)` returns a `deregister` function that removes only that entry. This is used internally by Context to manage subscriptions — each `subscribe()` call registers its `unsubscribe` function and gets back a deregister handle. `CleanupManager.destroy()` marks the manager as destroyed and runs all registered functions.

The two systems serve different scopes: Component cleanup is imperative and resource-keyed; Context cleanup is subscription-oriented and position-keyed.

---

## Module Dependency Graph

```
browser APIs (EventTarget, MutationObserver, document, requestAnimationFrame)
    │
    ├── Elem/Elem.js
    │       └── utils/buildClassList
    │
    ├── Context/Context.js
    │       ├── Context/Subscriber.js
    │       ├── Context/CleanupManager.js
    │       └── Context/ErrorHandler.js
    │
    ├── styled/
    │       ├── styled.js          → shimCSS, configured, classSafeNanoid, theme
    │       ├── shimCSS.js         → postCSS, themeStyles, appendStyles, rootContext
    │       ├── postCSS.js         → postcss, autoprefixer, postcss-nested
    │       ├── themeStyles.js     → theme
    │       └── appendStyles.js    (no internal deps)
    │
    └── Component/Component.js
            ├── Elem/Elem.js
            ├── Context/Context.js
            ├── styled/ (appendStyles, postCSS, themeStyles)
            ├── Component/observeElementConnection.js
            └── utils/classSafeNanoid

UI Components (Button, Input, Dialog, …)
    └── Component/Component.js   (directly or through TooltipWrapper/Form)
```

No circular dependencies exist in this graph. `rootContext` is a shared singleton used only by `shimCSS` for the pre-load style queue.
