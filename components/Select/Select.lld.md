# Select

> ./Select.js

Dropdown select that extends Input. The design decision: Select inherits Input's value lifecycle; `isDirty`, validations, and onChange work the same way for a Select as they do for a text Input. Callers don't learn a separate API.

## Select inherits the full Input value contract

- `isDirty`, validations, and onChange all work the same way as Input without any Select-specific API
  - does a Select have isDirty?
  - new Array() captures fired then new Subject({ options: ["a", "b"], onChange: () => fired.push(1) }) captures s then s.elem.value = "b" then s.elem.dispatchEvent(new Event("change", { bubbles: true })) -> fired.length === 1

## Options map in order, preserving sequence

Options frequently arrive from a fetch, so the list is routinely absent on the first render. A select with nothing to show is a normal state, not an error.

- an options list that is absent or not yet loaded renders an empty select rather than throwing, so a caller can pass the value straight through while it resolves
  - new Subject({ options: undefined, appendTo: document.body }) captures missing then new Subject({ options: null, appendTo: document.body }) captures empty -> missing.elem.options.length === 0 && empty.elem.options.length === 0

- items in the `options` array become select options in the same order; no automatic sorting or reindexing
  - new Subject({ options: ["alpha", "beta", "gamma"] }) captures s then Array.from(s.elem.querySelectorAll("option")).map(o => o.value) captures rendered -> rendered.join(",") === "alpha,beta,gamma"

An entry that carries its own `options` array is a group rather than a choice, so the array is one level of nesting rather than a flat list. Grouping is presentation only -- a grouped option is still an option, and reading `value` must not care which level it came from.

- an entry with a nested `options` array becomes an optgroup holding those choices; plain entries stay at the top level, and the value getter reaches a grouped option the same as an ungrouped one
  - new Subject({ options: [{ label: "Group A", options: ["a1", "a2"] }, "loose"], appendTo: document.body }) captures s then Array.from(s.elem.children).map(c => c.tagName) captures shape then s.elem.querySelector("optgroup") captures group -> shape.join(",") === "OPTGROUP,OPTION" && group.label === "Group A" && Array.from(group.children).map(o => o.value).join(",") === "a1,a2"
  - new Subject({ options: [{ label: "Group A", options: ["a1", "a2"] }, "loose"], appendTo: document.body }) captures s then s.value captures fromGroup then s.elem.options[2].selected = true then s.value captures fromTop -> fromGroup === "a1" && fromTop === "loose"

## The value getter returns the selected option's value, with label as fallback

- `select.value` returns the option's `value` attribute; if absent it falls back to `label`, then `textContent`
  - new Subject({ options: [{ value: "v1", label: "L1" }, { label: "L2" }, { textContent: "T3" }], appendTo: document.body }) captures s then s.elem.options[0].selected = true then s.value captures byAttr then s.elem.options[1].selected = true then s.value captures byLabel then s.elem.options[2].selected = true then s.value captures byText -> byAttr === "v1" && byLabel === "L2" && byText === "T3"
  - new Subject({ options: [], appendTo: document.body }) captures s -> s.value === "" && s.elem.selectedIndex === -1

## A select with options always reports the option it is showing

`value` is inherited from Input, which defaults it to the empty string, so a caller who never mentions a value is indistinguishable from one who asked for `''`. Treating the two the same deselects every option -- the control still displays its first entry while `select.value` reports nothing, and the mismatch only surfaces when the form is read. What the getter returns has to be the option the user can see.

- constructing a select with options and no explicit value reports the first option, matching what the closed control displays; an explicit value is still applied once the options exist
  - new Subject({ options: ["alpha", "beta"], appendTo: document.body }) captures s -> s.value === "alpha" && s.elem.selectedIndex === 0
  - new Subject({ options: [{ value: "v1", label: "L1" }, { value: "v2" }], appendTo: document.body }) captures byAttr then new Subject({ options: [{ label: "L2" }, { label: "L3" }], appendTo: document.body }) captures byLabel then new Subject({ options: [{ textContent: "T3" }, { textContent: "T4" }], appendTo: document.body }) captures byText -> byAttr.value === "v1" && byLabel.value === "L2" && byText.value === "T3"
  - new Subject({ options: ["alpha", "beta"], value: "beta", appendTo: document.body }) captures s -> s.value === "beta" && s.elem.selectedIndex === 1
  - new Subject({ value: "beta", options: ["alpha", "beta"], appendTo: document.body }) captures valueFirst then new Subject({ options: ["alpha", "beta"], value: "beta", appendTo: document.body }) captures optionsFirst -> valueFirst.elem.selectedIndex === 1 && optionsFirst.elem.selectedIndex === 1
  - new Subject({ options: [{ label: "none", value: "" }, "alpha"], value: "", appendTo: document.body }) captures s -> s.value === "" && s.elem.selectedIndex === 0
