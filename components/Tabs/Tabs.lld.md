# Tabs

> ./Tabs.js

A row of tabs, one selected. The design decision is that selection is the component's: pressing, the arrow keys, Home and End all select through one path, so `onChange` fires once per real change and panels, ARIA state and the roving tab stop never disagree.

## One selected, the first unless another is

- with no selection given, the first tab is selected and says so
  - new Subject({ tabs: [{ id: "a", label: "A" }, { id: "b", label: "B" }], appendTo: document.body }) captures t -> t.options.selected === "a" && t.elem.querySelector("[aria-selected=true]").dataset.tab === "a"

## Selecting is one path

- selecting a tab calls onChange once; selecting it again doesn't
  - new Array() captures calls then new Subject({ tabs: [{ id: "a", label: "A" }, { id: "b", label: "B" }], onChange: id => calls.push(id), appendTo: document.body }) captures t then t.select("b") then t.select("b") -> calls.join() === "b"

## A panel shows only while its tab is selected

- each tab's panel is hidden unless its tab is selected
  - new Array() captures probe then document.body.appendChild(document.createElement("div")) captures pa then document.body.appendChild(document.createElement("div")) captures pb then new Subject({ tabs: [{ id: "a", label: "A" }, { id: "b", label: "B" }], panels: { a: pa, b: pb }, appendTo: document.body }) captures t then t.select("b") -> pa.hidden === true && pb.hidden === false && pb.getAttribute("role") === "tabpanel"
