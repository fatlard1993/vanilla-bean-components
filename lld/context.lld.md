# Context

> Context/Context.js

Reactive state container built on the platform's own EventTarget. Property access and assignment look like a plain object — the reactivity is invisible. This is the point: callers write `ctx.name = "Alice"` and anything subscribed to `name` updates automatically, with no special setter syntax, no `.value` unwrapping, and no compile step.

The constructor returns a Proxy rather than the Context instance. `instanceof Context` returns false. This is an intentional trade-off: invisible reactivity requires intercepting assignment at the property level, and Proxy is the only mechanism that achieves this without changing the call site.

## Reactivity requires a plain object — nothing else is accepted

- the constructor rejects null, arrays, strings, and other non-plain-object types
  - does constructing with null throw?
  - does constructing with an array throw?
  - does constructing with a plain object succeed?

## Assignments fire synchronously, not on the next tick

- setting a property fires subscriptions before the assignment expression returns; no async tick, no batching, no deferred flush — the update is immediate
  - does a subscriber fire synchronously before the next line runs?

## Subscriptions are key-scoped — a listener only fires for its key

- subscribing to "name" fires only when name changes; other keys do not trigger it
  - does a subscriber for "name" not fire when a different key changes?

## The subscriber receives the new value, not the old one

- the callback argument is the value that was just assigned; the subscriber does not need to read the context again
  - does the subscriber receive the new value?

## EventTarget is the event bus — nothing is reinvented

- Context extends EventTarget; subscriptions are addEventListener calls under the hood — the native event API works as an alternative subscription path
  - does addEventListener work as a subscription path?

## Destroy stops subscriptions from firing

- destroy() marks the context destroyed and stops all future notifications
  - does destroy stop all future subscriptions from firing?

## isDestroyed is true after destroy

- a destroyed context stays destroyed; there is no reactivation
  - is isDestroyed true after destroy?

## Destroy is idempotent

- calling destroy a second time does not reactivate the context
  - does calling destroy twice keep isDestroyed true?

## Derived state freezes when its source is destroyed

- derived values stop updating when the source context they depend on is destroyed; the value freezes at its last known state and no error is thrown
  - does derived state freeze when its source context is destroyed?
