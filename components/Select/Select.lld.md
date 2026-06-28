# Select

> ./Select.js

Dropdown select that extends Input. The design decision: Select inherits Input's value lifecycle; `isDirty`, validations, and onChange work the same way for a Select as they do for a text Input. Callers don't learn a separate API.

## Select inherits the full Input value contract

- `isDirty`, validations, and onChange all work the same way as Input without any Select-specific API
  - does a Select have isDirty?
  - does a Select value change trigger onChange the same way as an Input?

## Options map in order, preserving sequence

- items in the `options` array become select options in the same order; no automatic sorting or reindexing
  - does the options array order match the dropdown order?

## The value getter returns the selected option's value, with label as fallback

- `select.value` returns the option's `value` attribute; if absent it falls back to `label`, then `textContent`
