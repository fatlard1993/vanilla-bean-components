# Form

> ./Form.js

Declarative form from an array of input configurations. The key design decision is that the form owns data binding. Each input's changes update a shared reactive `data` context, and `hasErrors()` validates the whole form in one call.

## Label text falls back to the field key - no separate label required for obvious fields

- if an input config omits `label`, the key name becomes the label
  - new Subject({ inputs: [{ key: "emailAddress" }], appendTo: document.body }) captures f -> f.elem.querySelector("label").textContent.toLowerCase().replace(/\s/g, "") === "emailaddress"

## hasErrors validates all inputs simultaneously and returns a boolean

- `hasErrors()` runs all validations and returns true if any failed, false if all passed; false means submittable
  - does hasErrors return false when all inputs are valid?
  - new Subject({ inputs: [{ key: "name", validations: [[v => !!v, "required"]] }], appendTo: document.body }) captures f -> f.hasErrors() === true

## Form data is live - changes are visible before any submit action

- each input's value feeds the shared `data` context as it changes
  - new Subject({ inputs: [{ key: "name" }], appendTo: document.body }) captures f then f.elem.querySelector("input") captures input then input.value = "typed" then input.dispatchEvent(new Event("change", { bubbles: true })) -> f.options.data.name === "typed"

## A conditional field is absent until its condition holds, and so are its rules

A field that does not apply yet must not block submission, so hiding a field and excluding it from validation are the same decision rather than two -- otherwise a form becomes unsubmittable because of a rule on a question nobody was asked. Conditions are re-evaluated whenever form data changes, not only at build.

- a field whose condition is unmet is hidden and its validation is not enforced; satisfying the condition reveals it and its rules start to apply
  - new Subject({ inputs: [{ key: "wantsPet", type: "checkbox", label: "Wants pet" }, { key: "petName", label: "Pet name", condition: d => d.wantsPet, validate: v => (v ? undefined : "required") }], appendTo: document.body }) captures f then f.hasErrors() captures errorsWhileHidden then Array.from(f.elem.querySelectorAll("label")).map(l => l.parentElement.style.display).join() captures displayWhileHidden then f.options.data.wantsPet = true then await new Promise(r => setTimeout(r, 80)) -> errorsWhileHidden === false && displayWhileHidden === ",none" && Array.from(f.elem.querySelectorAll("label")).map(l => l.parentElement.style.display).join() === "," && f.hasErrors() === true

## A field that becomes available is announced, not just shown

A field appearing partway down a form is easy to miss and impossible to see for a screen reader user, who has already read past that point. The form says which fields became available rather than leaving the change silent.

- revealing a conditional field announces it by name
  - new Subject({ inputs: [{ key: "wantsPet", type: "checkbox", label: "Wants pet" }, { key: "petName", label: "Pet name", condition: d => d.wantsPet, validate: v => (v ? undefined : "required") }], appendTo: document.body }) captures f then f.options.data.wantsPet = true then await new Promise(r => setTimeout(r, 80)) -> f._announcer.textContent === "Pet name now available"

## A checkbox is labelled beside itself, not above

A checkbox is narrow and its label reads as a sentence with it, so the label sits inline; every other field takes the default stacked arrangement. The form decides this from the field's type rather than asking the caller to specify layout per field.

- a checkbox field's label is laid out inline while other fields keep the default variant
  - new Subject({ inputs: [{ key: "wantsPet", type: "checkbox", label: "Wants pet" }, { key: "petName", label: "Pet name", condition: d => d.wantsPet, validate: v => (v ? undefined : "required") }], appendTo: document.body }) captures f then Array.from(f.elem.querySelectorAll("label")).map(l => l.parentElement.className.includes("variant-inline")) captures inline -> inline[0] === true && inline[1] === false

## Reassigning `inputs` rebuilds the fields around the data that is already there

A form whose field list changes -- a step added, a section swapped -- must not discard what the user has already typed, so the rebuild replaces the fields while the data store survives it. The listener that watches data for conditions is only attached when there is a condition to evaluate, so a form without any adds no subscription to clean up.

- assigning a new `inputs` list renders the new fields and keeps the values already collected
  - new Subject({ inputs: [{ key: "a", label: "A" }], appendTo: document.body }) captures f then f.options.data.a = "kept" then Array.from(f.elem.querySelectorAll("label")).length captures beforeCount then f.options.inputs = [{ key: "a", label: "A" }, { key: "b", label: "B" }] then await new Promise(r => setTimeout(r, 40)) -> beforeCount === 1 && f.elem.querySelectorAll("label").length === 2 && f.options.data.a === "kept"
- a form with no conditional fields registers no data subscription; one with them does
  - new Subject({ inputs: [{ key: "x", label: "X" }], appendTo: document.body }) captures plain then new Subject({ inputs: [{ key: "x", label: "X" }, { key: "y", label: "Y", condition: d => d.x }], appendTo: document.body }) captures conditional -> !plain.cleanup.conditions && !!conditional.cleanup.conditions
