# BottomSheet

> ./BottomSheet.js

Mobile-friendly overlay that slides up from the bottom of the screen, on the native `<dialog>`. The design decision: the platform owns what a modal is (its role, the inert page behind it, Escape), and the sheet owns only the slide and the drag. Dismissal has many triggers -- `close()`, Escape, a press on the dimmed page, a drag past a threshold, navigating away -- but all of them converge on the dialog's own `close` event, so cleanup, focus return and `onClose` are wired once no matter how the sheet closes.

## open() / close() control visibility, and closing is announced once

- `open()` shows the sheet as a modal dialog; `close()` slides it out
  - new Subject({ appendTo: document.body }) captures s then s.isOpen captures before then s.open() then s.isOpen captures during then s.close() -> before === false && during === true && s.isOpen === false
- `onClose` hears the `close` event however the sheet closed; closing a sheet that is already closed dismisses nothing and announces nothing
  - does calling open() then close() invoke the onClose callback?
  - does calling close() on a sheet that was never opened leave onClose uninvoked?
  - new Array() captures atCallback then new Subject({ appendTo: document.body, onClose: () => atCallback.push(s.isOpen) }) captures s then s.open() then s.close() then s.close() -> atCallback.length === 1 && atCallback[0] === false

## The sheet is a dialog, so the platform gives it a modal's semantics

- the element is a `<dialog>` opened with `showModal()`, so its role, the inert page and Escape come from the browser rather than from ARIA wiring
  - new Subject({ appendTo: document.body }) captures s then s.open() -> s.elem.tagName === "DIALOG" && s.elem.open === true

## Focus moves in on opening and goes back on closing

- opening focuses the first focusable thing in the sheet, and closing returns focus to whatever had it
  - new Array() captures probe then document.body.appendChild(document.createElement("button")) captures opener then document.createElement("button") captures inside then new Subject({ appendTo: document.body, append: inside }) captures s then opener.focus() then s.open() then document.activeElement captures during then s.close() -> during === inside && document.activeElement === opener

## Drag below the threshold dismisses the sheet

**browser:** true

The threshold exists so that small accidental drags do not dismiss the sheet. One pointer path serves mouse, touch and pen.

- a drag handle at the top of the sheet captures pointer events; dragging past a distance threshold closes it, and a short drag leaves it open
  - new Subject({ appendTo: document.body }) captures s then s.open() then s.isOpen captures shown then s.elem.querySelector(".sheet-drag-zone") captures zone then zone.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientY: 300 })) then zone.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientY: 700 })) then zone.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientY: 700 })) -> shown === true && s.isOpen === false
  - new Subject({ appendTo: document.body }) captures s then s.open() then s.elem.querySelector(".sheet-drag-zone") captures zone then zone.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientY: 300 })) then zone.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientY: 304 })) then zone.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientY: 304 })) -> s.isOpen === true

## Navigating away (hashchange) closes the sheet

The sheet does not outlive the navigation that moved away from it.

- a sheet that is open is closed when the location changes
  - new Subject({ appendTo: document.body }) captures s then s.open() then s.isOpen captures shown then location.hash = "#/elsewhere" then window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: "", newURL: String(location.href) })) -> shown === true && s.isOpen === false

## A sheet attaches to the page and offers its content region

An overlay that slides over everything belongs to the page, not to whatever component happened to construct it, so `document.body` is the default parent rather than a required option. Content goes in the sheet's own region rather than against the frame, which is what keeps the drag handle and the content from sharing a parent.

- a sheet with no explicit parent attaches to the document body and exposes the region its content belongs in
  - new Subject({}) captures s -> s.elem.parentElement === document.body && !!s.body && s.body.elem.tagName === "DIV"
