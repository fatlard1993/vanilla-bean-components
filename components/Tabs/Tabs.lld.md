# Tabs

> ./Tabs.js

A row of tabs, one selected. The design decision is that selection is the component's: pressing, the arrow keys, Home and End all select through one path, so `change` fires once per real change, carrying the id as `event.value` like every other change in the library, and panels, ARIA state and the roving tab stop never disagree.

## One selected, the first unless another is

- with no selection given, the first tab is selected and says so
  - new Subject({ tabs: [{ id: "a", label: "A" }, { id: "b", label: "B" }], appendTo: document.body }) captures t -> t.options.selected === "a" && t.elem.querySelector("[aria-selected=true]").dataset.tab === "a"

## Selecting is one path

- selecting a tab calls onChange once; selecting it again doesn't
  - new Array() captures calls then new Subject({ tabs: [{ id: "a", label: "A" }, { id: "b", label: "B" }], onChange: e => calls.push(e.value), appendTo: document.body }) captures t then t.select("b") then t.select("b") -> calls.join() === "b"

## A panel shows only while its tab is selected

- each tab's panel is hidden unless its tab is selected
  - new Array() captures probe then document.body.appendChild(document.createElement("div")) captures pa then document.body.appendChild(document.createElement("div")) captures pb then new Subject({ tabs: [{ id: "a", label: "A" }, { id: "b", label: "B" }], panels: { a: pa, b: pb }, appendTo: document.body }) captures t then t.select("b") -> pa.hidden === true && pb.hidden === false && pb.getAttribute("role") === "tabpanel"

## Segmented is the same tabs, drawn as a switch

- the segmented variant marks the tabs for its look and keeps them tabs
  - new Subject({ variant: "segmented", tabs: [{ id: "day", label: "By day" }, { id: "project", label: "By project" }], appendTo: document.body }) captures t -> t.elem.classList.contains("variant-segmented") && t.elem.getAttribute("role") === "tablist"
- a tab can carry an icon beside its label
  - new Subject({ tabs: [{ id: "chart", label: "Chart", icon: "chart-line" }], appendTo: document.body }) captures t -> t.elem.querySelector("[data-tab='chart']").classList.contains("fa-chart-line")

## Keys the row doesn't use are left to the page

- a key that is not an arrow, Home or End is not claimed
  - new Subject({ tabs: [{ id: "a", label: "A" }], appendTo: document.body }) captures t then t.elem.dispatchEvent(new KeyboardEvent("keydown", { key: "x", cancelable: true })) captures left -> left === true

## Tabs start empty, hide the panel of a tab removed, and count their own

- tabs default to an empty list
  - new Subject({}) captures t -> Array.isArray(t.options.tabs) && t.options.tabs.length === 0
- a tab removed from the list hides its panel
  - new Array() captures start then document.body.appendChild(document.createElement("div")) captures pa then document.body.appendChild(document.createElement("div")) captures pb then new Subject({ tabs: [{ id: "a", label: "A" }, { id: "b", label: "B" }], panels: { a: pa, b: pb }, selected: "a", appendTo: document.body }) captures t then (t.options.tabs = [{ id: "b", label: "B" }]) -> pa.hidden === true && pb.hidden === false
- count() records the count on the tab it names
  - new Subject({ tabs: [{ id: "a", label: "A" }, { id: "b", label: "B" }], appendTo: document.body }) captures t then t.count("b", 4) -> t.options.tabs[1].count === 4 && t.options.tabs[0].count === undefined
