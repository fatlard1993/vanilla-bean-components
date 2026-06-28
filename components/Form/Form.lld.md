# Form

> ./Form.js

Declarative form from an array of input configurations. The key design decision is that the form owns data binding. Each input's changes update a shared reactive `data` context, and `hasErrors()` validates the whole form in one call.

## Label text falls back to the field key — no separate label required for obvious fields

- if an input config omits `label`, the key name becomes the label
  - does an input with no label option display the key name as its label?

## hasErrors validates all inputs simultaneously and returns a boolean

- `hasErrors()` runs all validations and returns true if any failed, false if all passed; false means submittable
  - does hasErrors return false when all inputs are valid?
  - does hasErrors return true when an input's validation fails?

## Form data is live — changes are visible before any submit action

- each input's value feeds the shared `data` context as it changes
  - does typing in an input field update the form's data context before any submit?
