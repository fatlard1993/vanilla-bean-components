# Menu

> ./Menu.js

Styled list whose items emit a registered `select` CustomEvent, with the activation event in `detail`. The design decision: pointer and keyboard activation both resolve to the same `select` event -- the same principle Button applies to `onPointerPress` -- so keyboard and pointer users get the same experience without separate handlers. `onSelect` is the option-form listener for the event.

## Selecting a menu item works the same way regardless of input method

- clicking, touching, Space/Enter, and screen reader activation all emit `select`; one event, no separate keyboard path
  - does clicking a menu item invoke onSelect?
  - does pressing Enter on a focused menu item invoke onSelect?

## Menu renders any item format that List supports

- strings, objects with labels, and component instances all work as menu items
  - does a Menu with mixed string and object items render without error?

## Exactly one item is in the tab order at a time

A menu is one stop for the keyboard, not one stop per item: tabbing past a ten-item menu should take one press, and arrow keys move within it. That means a roving tabindex -- the first item is focusable, the rest are reachable only from inside.

- the first item carries `tabindex=0` and every other item `-1`, so the menu is a single tab stop
  - new Subject({ items: [{ textContent: "a" }, { textContent: "b" }, { textContent: "c" }], appendTo: document.body }) captures m then Array.from(m.elem.querySelectorAll("li")).map(li => li.getAttribute("tabindex")) captures tabs -> tabs.join() === "0,-1,-1"
- an items list that is absent renders an empty menu rather than throwing
  - new Subject({ items: undefined, appendTo: document.body }) captures missing then new Subject({ items: null, appendTo: document.body }) captures empty -> missing.elem.querySelectorAll("li").length === 0 && empty.elem.querySelectorAll("li").length === 0
- activation on a node outside the menu selects nothing, so a menu never claims an event that was not its own
  - new Array() captures fired then new Subject({ items: [{ textContent: "a" }], onSelect: () => fired.push(1), appendTo: document.body }) captures m then document.createElement("li") captures outsider then document.body.append(outsider) then outsider.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then outsider.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) -> fired.length === 0
- pressing the menu's own padding selects nothing either; only a press that lands on an item counts
  - new Array() captures fired then new Subject({ items: [{ textContent: "a" }], onSelect: () => fired.push(1), appendTo: document.body }) captures m then m.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then m.elem.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) then fired.length captures afterRootPress then m.elem.querySelector("li") captures item then item.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then item.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) -> afterRootPress === 0 && fired.length === 1

## Arrow keys move focus within the menu and wrap at both ends

The roving tabindex makes the menu one tab stop; arrow keys are what move inside it. Wrapping means a reader holding the key never lands on nothing, and it is what makes the first and last items reachable from each other without a Home/End convention.

- ArrowDown advances and wraps past the last item; ArrowUp retreats and wraps past the first
  - new Subject({ items: [{ textContent: "a" }, { textContent: "b" }, { textContent: "c" }], appendTo: document.body }) captures m then Array.from(m.elem.querySelectorAll("li")) captures lis then lis[0].focus() then new Array() captures seq then seq.push(lis.indexOf(document.activeElement)) then ["ArrowDown", "ArrowDown", "ArrowDown", "ArrowUp"].forEach(key => { m.elem.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })); seq.push(lis.indexOf(document.activeElement)); }) -> seq.join() === "0,1,2,0,2"
