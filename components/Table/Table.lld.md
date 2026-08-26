# Table

> ./Table.js

Sortable data table where sort state is explicit options. The design decision: `sortProperty` and `sortDirection` are readable and writable options; the sort state is in the component's options object, not hidden inside event handlers, so it's readable and settable from outside.

## Sort state lives in options - externally readable and settable

- clicking a column header updates `sortProperty` and `sortDirection` as regular options; external code can read or set sort state without querying the DOM. The first click on a column sorts it descending; a second click on the same column toggles to ascending -- sorting only moves between columns, there is no click back to unsorted
  - new Subject({ columns: [{ key: "name", content: "Name", sort: true }], data: [{ name: "b" }, { name: "a" }] }) captures t then t.elem.querySelector("th").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) -> t.options.sortProperty === "name" && t.options.sortDirection === "desc"
  - new Subject({ columns: [{ key: "name", content: "Name", sort: true }], data: [{ name: "b" }, { name: "a" }] }) captures t then t.elem.querySelector("th").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then t.elem.querySelector("th").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) -> t.options.sortDirection === "asc"

## Custom cell renderers receive the full row context, not just the cell value

- a column's `dataColumn` function receives `{ column, rowData, table }` so cells can cross-reference other columns or interact with the table
  - new Array() captures seen then new Subject({ columns: [{ key: "name", dataColumn: arg => { seen.push(arg); return {}; } }], data: [{ name: "x" }] }) captures t -> seen.length === 1 && seen[0].rowData.name === "x" && seen[0].table === t && seen[0].column.key === "name"

## Footer aligns with data columns, not with DOM order

- footer cells are positioned by column key; adding or reordering columns does not misalign footer labels from data
  - new Subject({ columns: [{ key: "name", content: "Name" }, { key: "amount", content: "Amount" }], data: [{ name: "x", amount: 1 }], footer: [{ key: "amount", content: "AMT" }, { key: "name", content: "NM" }] }) captures t then Array.from(t.elem.querySelectorAll("tfoot td")).map(c => c.textContent) captures cells -> cells.join(",") === "NM,AMT"

## A sortable column advertises its state, in the markup and in the icon

Sort state is not only a visual affordance: a reader using a screen reader needs to know which column the order comes from and which way it runs, which is what `aria-sort` carries. A sortable column that is not the sorted one shows the neutral affordance rather than nothing, so it reads as available rather than absent.

- every sortable column starts at `aria-sort="none"` with the neutral icon; the sorted column reports its direction and shows a directional icon while the others stay neutral
  - new Subject({ columns: [{ key: "name", label: "Name", sort: true }, { key: "age", label: "Age", sort: true }], data: [{ name: "b", age: 2 }, { name: "a", age: 1 }], appendTo: document.body }) captures t then Array.from(t.elem.querySelectorAll("th")).map(h => h.getAttribute("aria-sort")) captures initial then t.elem.querySelector("th") captures first then first.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then first.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) then Array.from(t.elem.querySelectorAll("th")).map(h => h.getAttribute("aria-sort")) captures afterFirst then first.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then first.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) -> initial.join() === "none,none" && afterFirst.join() === "descending,none" && Array.from(t.elem.querySelectorAll("th")).map(h => h.getAttribute("aria-sort")).join() === "ascending,none"
- the sorted column's icon points the way the order runs; a sortable column that is not sorted keeps the neutral icon
  - new Subject({ columns: [{ key: "name", label: "Name", sort: true }, { key: "age", label: "Age", sort: true }], data: [{ name: "b", age: 2 }, { name: "a", age: 1 }], appendTo: document.body }) captures t then Array.from(t.elem.querySelectorAll("th")).map(h => Array.from(h.querySelectorAll("*")).flatMap(e => Array.from(e.classList).filter(c => c.startsWith("fa-sort"))).join()) captures initial then t.elem.querySelector("th") captures first then first.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then first.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) then Array.from(t.elem.querySelectorAll("th")).map(h => Array.from(h.querySelectorAll("*")).flatMap(e => Array.from(e.classList).filter(c => c.startsWith("fa-sort"))).join()) captures sorted -> initial.join("|") === "fa-sort|fa-sort" && sorted.join("|") === "fa-sort-up|fa-sort"
- a data set that is absent renders an empty table rather than throwing
  - new Subject({ columns: [{ key: "a", label: "A" }], data: undefined, appendTo: document.body }) captures missing then new Subject({ columns: [{ key: "a", label: "A" }], data: null, appendTo: document.body }) captures empty -> missing.elem.querySelectorAll("tbody tr").length === 0 && empty.elem.querySelectorAll("tbody tr").length === 0

- option changes made before the first render are recorded without rendering; the first render then reflects them
  - new Array() captures sorted then new Subject({ autoRender: false, columns: [{ key: "a", label: "A", sort: true }], data: [{ a: 1 }], onSort: (p, d) => sorted.push(d) }) captures t then t.options.sortDirection = "asc" then sorted.length captures beforeRender then t.render() then t.options.sortDirection = "desc" -> beforeRender === 0 && sorted.join() === "desc"
