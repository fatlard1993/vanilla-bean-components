# ContextMenu

> ./ContextMenu.js

A Menu in a Popover that opens at a point. The design decision is that the menu closes itself after a choice, on Escape and on a press outside, and returns focus to where it was, so every caller gets the same dismissal and keyboard behaviour instead of wiring document listeners of its own.

## A choice runs and closes

- choosing an item runs its handler and closes the menu, unless the menu is sticky
  - new Array() captures calls then new Subject({ items: [{ textContent: "a", onPointerPress: () => calls.push("a") }], appendTo: document.body }) captures menu then menu.show({ x: 10, y: 10 }) then menu.elem.querySelector("li").click() -> calls.join() === "a" && menu.shown === false
  - new Array() captures calls then new Subject({ sticky: true, items: [{ textContent: "a", onPointerPress: () => calls.push("a") }], appendTo: document.body }) captures menu then menu.show({ x: 10, y: 10 }) then menu.elem.querySelector("li").click() -> calls.join() === "a" && menu.shown === true

## Escape closes it

- Escape closes an open menu
  - new Subject({ items: [{ textContent: "a" }], appendTo: document.body }) captures menu then menu.show({ x: 10, y: 10 }) then document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })) -> menu.shown === false
