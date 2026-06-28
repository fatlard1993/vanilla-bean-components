# Component

> lld/helpers/component.js

Component extends Elem with a lifecycle and reactive options. The design goal is predictability: render always produces the same result for the same options, no diffing surprises, no residual state from a previous render. The options object is an Oxject instance, so any assignment to an option property is automatically reactive; subclasses don't wire this up themselves.

## Render is destructive — no diffing, no patching

**method:** `destructiveRender`

- `render()` empties the element completely before calling `build()`; there is no diff, no patch, no partial update. The element fully reflects current options state after every render
  - destructiveRender() → true

## Options are a reactive Oxject instance, not a plain object

**method:** `optionReactionFires`

- `this.options` is an Oxject proxy; assigning to any option property triggers the reactive update cycle automatically; subclasses do not register reactive wiring manually
  - optionReactionFires() → 1

## `build()` runs before options are processed

**method:** `buildBeforeOptions`

- `build()` establishes the DOM structure before any option logic runs on it; options that depend on DOM elements being present always find those elements in place
  - buildBeforeOptions() → true

## Some options are processed before others

**method:** `priorityRunsFirst`

- `priorityOptions` is a set of option names that run first in `processOptions`; this handles cases where one option's correct behavior depends on another having already been applied
  - priorityRunsFirst() → true

## Cleanup prevents accumulation on re-render

**method:** `replaceCleanupRunsOnce`

- `replaceCleanup` replaces any existing cleanup registered under the same key, preventing duplicate handlers when the component re-renders; `addCleanup` chains, `replaceCleanup` replaces
  - replaceCleanupRunsOnce() → 1
