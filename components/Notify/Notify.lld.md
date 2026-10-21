# Notify

> ./Notify.js

Transient notification that self-destructs. The design choice is that click-to-dismiss is always on; every notification is interactive, not a passive message. The `type` option drives icon and color selection so callers communicate intent rather than manually picking icons.

## Type communicates intent; the component selects the appropriate icon

- callers pass `type: 'error'` and the component picks the matching icon; a custom `icon` option overrides this only when the standard mapping doesn't fit
  - new Subject({ type: "success", textContent: "x" }) captures ok then new Subject({ type: "error", textContent: "x" }) captures bad then [ok, bad].map(n => (n.elem.className.match(/fa-[\w-]+/g) || []).join(" ")) captures icons -> icons[0].includes("fa-") && icons[1].includes("fa-") && icons[0] !== icons[1]

## Clicking anywhere on the notification dismisses it - the whole surface is the target

Notifications are temporary and should be easy to clear, so there is no separate close button to aim at.

- a click anywhere on the notification dismisses it, its body included, rather than only on a dedicated control
  - new Subject({ textContent: "hi", appendTo: document.body }) captures n then n.elem.isConnected captures shown then n.elem.click() -> shown === true && n.elem.isConnected === false

## Manual dismiss cancels a pending timeout - no duplicate destroy fires

- when a `timeout` is set and the user dismisses manually before it fires, the timer is cancelled so a second destroy call after the component is already gone cannot happen
  - new Array() captures calls then new Subject({ timeout: 50, appendTo: document.body, textContent: "hi" }) captures n then n.destroy = (...a) => { calls.push(1); return Object.getPrototypeOf(n).destroy.call(n, ...a); } then n.elem.click() then await new Promise(r => setTimeout(r, 160)) -> calls.length === 1

## Severity decides how assertively the notification announces

A screen reader interrupts for `alert` and waits for a quiet moment for `status`. Errors and warnings are worth interrupting for; a success or an informational note is not, and interrupting for those trains people to ignore the ones that matter.

- `error` and `warning` announce as alerts; every other type announces politely
  - new Subject({ type: "error", content: "m", appendTo: document.body }) captures err then new Subject({ type: "warning", content: "m", appendTo: document.body }) captures warn then new Subject({ type: "success", content: "m", appendTo: document.body }) captures ok then new Subject({ type: "info", content: "m", appendTo: document.body }) captures info -> err.elem.getAttribute("role") === "alert" && warn.elem.getAttribute("role") === "alert" && ok.elem.getAttribute("role") === "status" && info.elem.getAttribute("role") === "status"

- a falsy `timeout` means the notification stays until something dismisses it; a positive one dismisses it after that long
  - new Subject({ content: "stay", timeout: 0, appendTo: document.body }) captures kept then new Subject({ content: "go", timeout: 30, appendTo: document.body }) captures going then await new Promise(r => setTimeout(r, 90)) -> kept.elem.isConnected === true && going.elem.isConnected === false

## Severity also decides how long it stays

A success or an informational note says something that needs no answer, so it leaves on its own. A warning or an error may need acting on, so it waits to be tapped. A `timeout` given, zero included, overrides either.

- info and success dismiss themselves after four seconds; warning and error stay until dismissed
  - new Subject({ type: "info", autoOpen: false, appendTo: document.body }) captures info then new Subject({ type: "error", autoOpen: false, appendTo: document.body }) captures error -> info.options.timeout === 4000 && error.options.timeout === 0

## Toasts placed at no point stack in a corner

Without an `x` and `y`, a notification joins a stack in the bottom-right corner, the newest at the bottom, so several at once read as a list rather than piling on one another. When one leaves, the rest close the gap.

- notifications without a point stack, the newest nearest the edge, and close up when one goes
  - new Subject({ textContent: "older", autoOpen: false, appendTo: document.body }) captures older then older.show() then new Subject({ textContent: "newer", autoOpen: false, appendTo: document.body }) captures newer then newer.show() then Number(older.elem.style.bottom.match(/\d+/)[0]) captures olderBefore then newer.destroy() -> olderBefore > 16 && older.elem.style.bottom.startsWith("calc(16px ")
- a notification given a point is placed there and kept out of the stack
  - new Subject({ x: 40, y: 40, autoOpen: false, appendTo: document.body }) captures placed then placed.show() -> !placed.elem.classList.contains("stacked")


## An action is the one thing worth doing about the message

A toast that says something was deleted is the right place to undo it. The action runs once, however many times it's pressed, and the toast leaves when it's done; an action that reports it couldn't finish keeps the toast so it can be tried again.

- an action's handler gets the toast, and the toast closes once the handler settles; returning false keeps it
  - new Array() captures calls then new Subject({ content: "m", actions: [{ textContent: "Undo", onPress: n => { calls.push(n); } }], appendTo: document.body }) captures n then n.elem.querySelector(".notify-actions button").click() then await new Promise(r => setTimeout(r, 20)) -> calls[0] === n && n.elem.isConnected === false
  - new Subject({ content: "m", actions: [{ textContent: "Retry", onPress: () => false }], appendTo: document.body }) captures n then n.elem.querySelector(".notify-actions button").click() then await new Promise(r => setTimeout(r, 20)) -> n.elem.isConnected === true

## A hand on the toast holds it

- a pointer over the toast holds its timeout
  - new Subject({ content: "m", timeout: 30, appendTo: document.body }) captures n then n.elem.dispatchEvent(new Event("pointerenter")) then await new Promise(r => setTimeout(r, 90)) -> n.elem.isConnected === true
