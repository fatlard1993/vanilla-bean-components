# RadioButton

> ./RadioButton.js

Radio group from an array of options. The design decision: the HTML `name` coordination that makes radios mutually exclusive is handled automatically; callers pass values and get a working group without managing name attributes.

## All radios in the group share one name - mutual exclusivity is provided by the browser

- the component generates a shared `name` attribute; the browser enforces that only one radio in the group can be checked at a time
  - does each radio input in the group share the same name attribute?

## Options can separate their stored value from their display label

- a string option uses its value as both the label and stored datum; an object with `label` and `value` lets them differ, useful when the stored value (an ID, a code) would be confusing as a visible label
  - new Subject({ options: [{ label: "Visible", value: "v" }], value: "v" }) captures r -> r.elem.textContent.includes("Visible") && r.elem.textContent.includes("v") === false

## The selected option is named by `value`, in both directions

A radio group has one value, and it is the option's own value -- not the browser's default `on`, which would make every option report the same string. Assigning `value` moves the selection; picking an option reports that option back.

- each option's value reaches its input, so the group's value identifies which option is selected
  - new Subject({ options: ["a", "b", "c"], value: "b", appendTo: document.body }) captures r then Array.from(r.elem.querySelectorAll("input")).map(i => i.value + (i.checked ? "*" : "")) captures state -> state.join() === "a,b*,c"
- assigning `value` moves the selection to the matching option rather than clearing it
  - new Subject({ options: ["a", "b", "c"], value: "b", appendTo: document.body }) captures r then r.options.value = "c" then Array.from(r.elem.querySelectorAll("input")).map(i => i.value + (i.checked ? "*" : "")) captures state -> state.join() === "a,b,c*"
- choosing an option reports that option's value, not a shared default
  - new Subject({ options: ["a", "b", "c"], value: "b", appendTo: document.body }) captures r then r.elem.querySelectorAll("input")[0] captures first then first.checked = true then first.dispatchEvent(new Event("change", { bubbles: true })) -> r.options.value === "a"
- an options list that is absent renders an empty group rather than throwing
  - new Subject({ options: undefined, appendTo: document.body }) captures missing then new Subject({ options: null, appendTo: document.body }) captures empty -> missing.elem.querySelectorAll("input").length === 0 && empty.elem.querySelectorAll("input").length === 0
