# ContextMenu

> ./ContextMenu.js

A Menu in a Popover that opens at a point. The design decision is that the menu closes itself after a choice, on Escape and on a press outside, and returns focus to where it was, so every caller gets the same dismissal and keyboard behaviour instead of wiring document listeners of its own.

## A choice runs and closes

- choosing an item runs its handler and closes the menu, unless the menu is sticky
  - new Array() captures calls then new Subject({ items: [{ textContent: "a", onPointerPress: () => calls.push("a") }], appendTo: document.body }) captures menu then menu.open({ x: 10, y: 10 }) then menu.elem.querySelector("li").click() -> calls.join() === "a" && menu.isOpen === false
  - new Array() captures calls then new Subject({ sticky: true, items: [{ textContent: "a", onPointerPress: () => calls.push("a") }], appendTo: document.body }) captures menu then menu.open({ x: 10, y: 10 }) then menu.elem.querySelector("li").click() -> calls.join() === "a" && menu.isOpen === true

## Escape closes it

- Escape closes an open menu
  - new Subject({ items: [{ textContent: "a" }], appendTo: document.body }) captures menu then menu.open({ x: 10, y: 10 }) then document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })) -> menu.isOpen === false

## A button toggles the menu it opened

A menu under a button belongs to that button: pressing it again is how people expect to put the menu away, and the button says whether its menu is open, for assistive tech.

- opening it again from the same anchor closes it, and the anchor reports whether it's expanded
  - new Array() captures probe then document.body.appendChild(document.createElement("button")) captures anchor then new Subject({ items: [{ textContent: "a" }], appendTo: document.body }) captures menu then menu.open({ anchor }) then anchor.getAttribute("aria-expanded") captures opened then menu.open({ anchor }) -> opened === "true" && menu.isOpen === false && anchor.getAttribute("aria-expanded") === "false"

## A heading is not an item

- a heading row is presentational and focus starts on the first real item
  - new Subject({ items: [{ heading: "Group" }, { textContent: "a" }], appendTo: document.body }) captures menu then menu.open({ x: 10, y: 10 }) -> menu.elem.querySelector("li").getAttribute("role") === "presentation" && document.activeElement.textContent === "a"

## The point it opened at is marked

A right-click or long press opens the menu away from anything that shows where it came from; a mark at the point ties the two together while the menu is open. A menu under a button already hangs from what opened it.

- a menu opened at a point marks it, and closing takes the mark away
  - new Subject({ items: [{ textContent: "a" }], appendTo: document.body }) captures menu then menu.open({ x: 10, y: 10 }) then Array.from(document.body.children) captures during then menu.close() -> during.at(-1) !== menu.elem && during.at(-1).isConnected === false && menu.elem.isConnected
- a menu under a button, or one told reticle: false, marks nothing
  - new Array() captures probe then document.body.appendChild(document.createElement("button")) captures anchor then new Subject({ items: [{ textContent: "a" }], appendTo: document.body }) captures menu then menu.open({ anchor }) -> document.body.lastElementChild === menu.elem
  - new Subject({ reticle: false, items: [{ textContent: "a" }], appendTo: document.body }) captures menu then menu.open({ x: 10, y: 10 }) -> document.body.lastElementChild === menu.elem
