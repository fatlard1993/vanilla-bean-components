# Button

> ./Button.js

Activatable element that unifies pointer and keyboard interaction under one handler. The design decision is that activation, regardless of whether it came from a click, touch, Space, or Enter, always routes through `onPointerPress`. Callers write one handler, not three.

## Keyboard and pointer share one activation handler

- Space and Enter activate the button the same way a click does; the caller registers one `onPointerPress` and it fires for all input types
  - does pressing Enter on a focused Button invoke onPointerPress?
  - does clicking a Button invoke onPointerPress?

## Caller-provided onKeyUp is preserved alongside activation logic

- a caller-provided `onKeyUp` runs alongside the built-in keyboard activation; registering both handlers does not suppress either
  - new Array() captures calls then new Subject({ onPointerPress: () => calls.push("press"), onKeyUp: () => calls.push("custom") }) captures b then document.body.append(b.elem) then b.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: true })) -> calls.includes("press") && calls.includes("custom")

## Tooltip is automatic - no setup beyond the tooltip option

- a `tooltip` option produces tooltip behaviour with no additional wiring at the call site
  - new Subject({ tooltip: "Save changes", appendTo: document.body }) captures b then b.elem.querySelector("[popover]") captures tip -> !!tip && tip.textContent === "Save changes"
  - new Subject({ tooltip: "Save changes", appendTo: document.body }) captures b then b.elem.querySelector("[popover]") captures tip then tip.style.display captures before then b.elem.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, clientX: 10, clientY: 10 })) then await new Promise(r => setTimeout(r, 760)) -> before === "" && tip.style.display === "block"

## Only Space and Enter activate; every other key passes through

Keyboard activation is deliberately two keys, not "any key". A button that fired on arrows or Tab would steal navigation from the page around it, which is the failure that makes keyboard users avoid custom controls.

- Space and Enter invoke `onPointerPress`; other keys leave it uninvoked
  - new Array() captures fired then new Subject({ onPointerPress: e => fired.push(e.code), appendTo: document.body }) captures b then ["Enter", "Space", "KeyA", "Tab", "Escape"].forEach(code => b.elem.dispatchEvent(new KeyboardEvent("keyup", { key: code, code, bubbles: true }))) -> fired.join() === "Enter,Space"
