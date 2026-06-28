# TagList

> ./TagList.js

Editable tag collection. The key decision: read-only mode removes the editing interface entirely rather than disabling it; a read-only TagList is structurally simpler, not just interaction-blocked.

## Read-only mode produces a different structure, not just disabled controls

- `readOnly: true` omits the input and add button entirely; `readOnly: false` includes the full editing interface
  - does a readOnly TagList contain no input element?
  - does a non-readOnly TagList contain both an input and an add button?

## Duplicate tags are silently rejected — adding them does nothing

**method:** `duplicateRejected`

- attempting to add a tag that already exists leaves the list unchanged; there is no error
  - duplicateRejected() → true

## The add interface stays at the end as tags are added and removed

**method:** `inputIsLastAfterAdd`

- new tags are inserted before the add-tag input; the input remains the last element automatically
  - inputIsLastAfterAdd() → true

## Cleanup removes the editing interface completely on destroy

- the input, button, and popover are destroyed with the component, removing event listeners
  - does destroying the TagList remove its editing interface from the DOM?
