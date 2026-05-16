# Input

> ./Input.js

Input element that infers its type from the value it receives rather than requiring callers to declare it. The deeper design decision is that `isDirty` makes unsaved-change detection a first-class property — forms don't need to track initial values themselves.

## Type is communicated by the value, not by a separate option

- callers pass a value; the input determines its type from that value's type
  - does a number value produce an input that accepts numeric entry?
  - does a boolean value produce an input that represents a checked/unchecked state?

## isDirty reflects whether the value has changed from its initial state

- the initial value is recorded at construction; `isDirty` answers "has the user changed this?" without external tracking
  - does isDirty return false when the value matches the initial value?
  - does isDirty return true after the value has been changed?

## Validation errors are surfaced as element state, not return values

- when a validation fails, the element enters an error state that CSS can target; passing clears it
  - does a failing validation leave the input in an error state?
  - does a passing validation clear the error state?

## Textarea height follows content automatically

- when `tag: 'textarea'`, the element resizes to fit its content without the caller managing height
  - does a textarea grow taller when its content exceeds its current height?
