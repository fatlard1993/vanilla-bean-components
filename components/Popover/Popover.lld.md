# Popover

> ./Popover.js

Native popover element with edge-aware placement. The design decision: position is calculated at show time, not at construction; the popover adapts to wherever in the viewport it needs to appear, at the moment it appears.

## Placement adapts to viewport edges at the moment of showing

**browser:** true

- when the popover would overflow an edge, the position flips; this calculation runs on each `show()` call so it stays accurate as the page scrolls or resizes
  - new Subject({ ...{ maxWidth: 264, maxHeight: 132, state: "manual", outsideClose: false, autoOpen: false, uniqueId: true }, x: 10, y: 10 }) captures near then near.show() then new Subject({ ...{ maxWidth: 264, maxHeight: 132, state: "manual", outsideClose: false, autoOpen: false, uniqueId: true }, x: window.innerWidth - 10, y: 10 }) captures far then far.show() -> near.elem.style.left !== "unset" && far.elem.style.left === "unset" && far.elem.style.right !== "unset"

## autoOpen fires after a short delay, not immediately

- `autoOpen: true` queues `show()` after 200ms; failing immediately would break when the popover's anchor isn't yet in the DOM
  - does a popover with autoOpen not open synchronously on construction?
  - new Subject({ autoOpen: true, state: "manual", uniqueId: true, appendTo: document.body }) captures cancelled then new Subject({ autoOpen: true, state: "manual", uniqueId: true, appendTo: document.body }) captures control then await new Promise(r => setTimeout(r, 40)) then Object.keys(cancelled.cleanup) captures armed then cancelled.processCleanup() then await new Promise(r => setTimeout(r, 320)) -> armed.includes("autoOpen") && cancelled.elem.style.display !== "block" && control.elem.style.display === "block"

## Manual and auto state are distinct dismiss models

- `state: 'auto'` delegates dismiss to the platform's native light-dismiss; `state: 'manual'` requires explicit `close()`; the choice belongs to the use site
  - new Subject({ state: "auto", autoOpen: false, uniqueId: true, maxWidth: 264, maxHeight: 132, outsideClose: false }) captures a then new Subject({ state: "manual", autoOpen: false, uniqueId: true, maxWidth: 264, maxHeight: 132, outsideClose: false }) captures m -> a.elem.getAttribute("popover") === "auto" && m.elem.getAttribute("popover") === "manual"
