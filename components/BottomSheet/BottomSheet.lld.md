# BottomSheet

> ./BottomSheet.js

Mobile-friendly overlay that slides up from the bottom of the screen. The design decision: dismissal has three distinct triggers -- explicit `hide()`, a drag gesture past a threshold, and navigating away -- but all three converge on the same dismissal path, so cleanup and `onClose` only need to be wired once no matter how the sheet closes.

## show() / hide() control visibility

- calling `show()` slides the sheet into view; calling `hide()` slides it out
- `onClose` fires when the sheet is dismissed (either by drag or by `hide()`); hiding a sheet that is already closed dismisses nothing and announces nothing
  - does calling show() then hide() invoke the onClose callback?
  - does calling hide() on an already-closed sheet leave onClose uninvoked?
  - new Array() captures atCallback then new Subject({ appendTo: document.body, onClose: () => atCallback.push(s.elem.classList.contains("open")) }) captures s then s.show() then s.hide() -> atCallback.length === 1 && atCallback[0] === false

## Drag below the threshold dismisses the sheet

**browser:** true

The threshold exists so that small accidental drags do not dismiss the sheet.

- a drag handle at the top of the sheet captures pointer events; dragging past a distance threshold triggers `hide()`
  - new Subject({ appendTo: document.body }) captures s then s.show() then s.elem.classList.contains("open") captures shown then s.elem.querySelector("*") captures zone then zone.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientY: 300 })) then window.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientY: 700 })) then window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, clientY: 700 })) -> shown === true && s.elem.classList.contains("open") === false
  - new Subject({ appendTo: document.body }) captures s then s.show() then s.elem.querySelector("*") captures zone then zone.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientY: 300 })) then window.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientY: 304 })) then window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, clientY: 304 })) -> s.elem.classList.contains("open") === true

## Navigating away (hashchange) closes the sheet

The sheet does not outlive the navigation that moved away from it.

- a sheet that is showing is dismissed when the location changes; a sheet that is already hidden is unaffected by navigation
  - new Subject({ appendTo: document.body }) captures s then s.show() then s.elem.classList.contains("open") captures shown then location.hash = "#/elsewhere" then window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: "", newURL: String(location.href) })) -> shown === true && s.elem.classList.contains("open") === false

## A sheet attaches to the page and offers its content region

An overlay that slides over everything belongs to the page, not to whatever component happened to construct it, so `document.body` is the default parent rather than a required option. Content goes in the sheet's own region rather than against the frame, which is what keeps the drag handle and the content from sharing a parent.

- a sheet with no explicit parent attaches to the document body and exposes the region its content belongs in
  - new Subject({}) captures s -> s.elem.parentElement === document.body && !!s.body && s.body.elem.tagName === "DIV"
