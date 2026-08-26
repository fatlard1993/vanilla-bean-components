# List

> ./List.js

Flexible list that meets items where they are. The core design decision: items can be strings, DOM nodes, component instances, or configuration objects; the component figures out what to do with each format. Callers don't normalize data before passing it.

## Items render correctly regardless of their input format

- a single `items` array can contain mixed formats without error
  - does a List render a mix of string and object items without failing?
  - new Subject({ items: undefined, appendTo: document.body }) captures missing then new Subject({ items: null, appendTo: document.body }) captures empty -> missing.elem.querySelectorAll("li").length === 0 && empty.elem.querySelectorAll("li").length === 0
  - new Array() captures received then new Subject({ items: [{ textContent: "hi", listItemOptions: { addClass: "wrap" }, ListItemComponent: class { constructor(o) { received.push(Object.keys(o).join(",")); this.elem = document.createElement("b"); this.elem.textContent = "C"; } } }], appendTo: document.body }) captures l then l.elem.querySelector("li") captures li -> li.classList.contains("wrap") && received.length === 1 && !received[0].includes("listItemOptions")

## Per-item component overrides compose cleanly with the global default

- the component set globally on the list applies to all items; a per-item `ListItemComponent` overrides for that item only
  - new Subject({ items: ["plain", { textContent: "x", ListItemComponent: class { constructor(o) { this.elem = document.createElement("b"); this.elem.textContent = "CUSTOM"; } } }] }) captures l then document.body.append(l.elem) then Array.from(l.elem.querySelectorAll("li")) captures items -> items.length === 2 && items[0].textContent === "plain" && items[1].querySelector("b").textContent === "CUSTOM"

## noStyle opts out of default list chrome for embedding contexts

**browser:** true

The chrome being removed is CSS, so the check has to ask a real engine what it computed; a class name on the element proves only that the class was set.

- `noStyle: true` removes the default list chrome (bullets, padding and line-height), leaving spacing to the embedding layout
  - new Subject({ items: ["a"], noStyle: true, appendTo: document.body }) captures plain then new Subject({ items: ["a"], appendTo: document.body }) captures styled then getComputedStyle(plain.elem) captures ps then getComputedStyle(styled.elem) captures ss -> ps.listStyleType === "none" && ps.paddingLeft === "0px" && ss.listStyleType !== "none"
