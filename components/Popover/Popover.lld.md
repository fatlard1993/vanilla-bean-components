# Popover

> ./Popover.js

Native popover element with edge-aware placement. The design decision: position is calculated at open time, not at construction; the popover adapts to wherever in the viewport it needs to appear, at the moment it appears.

## Placement adapts to viewport edges at the moment of opening

**browser:** true

- when the popover would overflow an edge, the position flips; this calculation runs on each `open()` call so it stays accurate as the page scrolls or resizes
  - new Subject({ ...{ maxWidth: 264, maxHeight: 132, state: "manual", outsideClose: false, autoOpen: false, uniqueId: true }, x: 10, y: 10 }) captures near then near.open() then new Subject({ ...{ maxWidth: 264, maxHeight: 132, state: "manual", outsideClose: false, autoOpen: false, uniqueId: true }, x: window.innerWidth - 10, y: 10 }) captures far then far.open() -> near.elem.style.left !== "unset" && far.elem.style.left === "unset" && far.elem.style.right !== "unset"
- a point off the viewport is pulled onto it, so the popover is never placed out of sight
  - new Subject({ ...{ maxWidth: 100, maxHeight: 40, state: "manual", outsideClose: false, autoOpen: false, uniqueId: true }, viewport: { getBoundingClientRect: () => ({ left: 0, top: 0, right: 400, bottom: 300 }) }, x: -500, y: -200 }) captures p then p.open() -> p.elem.style.left === "12px" && p.elem.style.top === "12px"

## autoOpen fires after a short delay, not immediately

- `autoOpen: true` queues `open()` after 200ms; failing immediately would break when the popover's anchor isn't yet in the DOM
  - does a popover with autoOpen not open synchronously on construction?
  - new Subject({ autoOpen: true, state: "manual", uniqueId: true, appendTo: document.body }) captures cancelled then new Subject({ autoOpen: true, state: "manual", uniqueId: true, appendTo: document.body }) captures control then await new Promise(r => setTimeout(r, 40)) then Object.keys(cancelled.cleanup) captures armed then cancelled.processCleanup() then await new Promise(r => setTimeout(r, 320)) -> armed.includes("autoOpen") && cancelled.elem.style.display !== "block" && control.elem.style.display === "block"

## Manual and auto state are distinct dismiss models

- `state: 'auto'` delegates dismiss to the platform's native light-dismiss; `state: 'manual'` requires explicit `close()`; the choice belongs to the use site
  - new Subject({ state: "auto", autoOpen: false, uniqueId: true, maxWidth: 264, maxHeight: 132, outsideClose: false }) captures a then new Subject({ state: "manual", autoOpen: false, uniqueId: true, maxWidth: 264, maxHeight: 132, outsideClose: false }) captures m -> a.elem.getAttribute("popover") === "auto" && m.elem.getAttribute("popover") === "manual"

## Where a popover lives, and what opens it

- with no parent given, it is appended to the body
  - new Subject({ autoOpen: false }) captures p -> p.elem.parentElement === document.body
- autoOpen false opens nothing, however long it waits
  - new Subject({ autoOpen: false, appendTo: document.body }) captures p then await new Promise(r => setTimeout(r, 260)) -> p.isOpen === false
- the platform opening it (a popovertarget button) is known: isOpen follows the toggle
  - new Subject({ autoOpen: false, appendTo: document.body }) captures p then p.isOpen captures before then p.elem.dispatchEvent(Object.assign(new Event("toggle"), { newState: "open" })) -> before === false && p.isOpen === true
- half a point places nothing
  - new Subject({ autoOpen: false, appendTo: document.body }) captures p then p.open({ x: 10 }) -> p.elem.style.left === "" && p.isOpen === true

## A point given to open() places the popover

- open({ x, y }) places it just below and right of the point
  - new Subject({ autoOpen: false, appendTo: document.body }) captures p then (document.documentElement.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1920, bottom: 1080 })) then p.open({ x: 100, y: 100 }) then delete document.documentElement.getBoundingClientRect -> p.elem.style.left === "112px" && p.elem.style.top === "112px"
