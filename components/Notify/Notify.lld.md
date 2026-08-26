# Notify

> ./Notify.js

Transient notification that self-destructs. The design choice is that click-to-dismiss is always on; every notification is interactive, not a passive message. The `type` option drives icon and color selection so callers communicate intent rather than manually picking icons.

## Type communicates intent; the component selects the appropriate icon

- callers pass `type: 'error'` and the component picks the matching icon; a custom `icon` option overrides this only when the standard mapping doesn't fit
  - new Subject({ type: "success", textContent: "x" }) captures ok then new Subject({ type: "error", textContent: "x" }) captures bad then [ok, bad].map(n => (n.elem.className.match(/fa-[\w-]+/g) || []).join(" ")) captures icons -> icons[0].includes("fa-") && icons[1].includes("fa-") && icons[0] !== icons[1]

## Clicking anywhere on the notification dismisses it - the whole surface is the target

Notifications are temporary and should be easy to clear, so there is no separate close button to aim at.

- a click anywhere on the notification dismisses it, its body included, rather than only on a dedicated control
  - new Subject({ textContent: "hi", appendTo: document.body }) captures n then n.elem.isConnected captures shown then n.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) -> shown === true && n.elem.isConnected === false

## Manual dismiss cancels a pending timeout - no duplicate destroy fires

- when a `timeout` is set and the user dismisses manually before it fires, the timer is cancelled so a second destroy call after the component is already gone cannot happen
  - new Array() captures calls then new Subject({ timeout: 50, appendTo: document.body, textContent: "hi" }) captures n then n.destroy = (...a) => { calls.push(1); return Object.getPrototypeOf(n).destroy.call(n, ...a); } then n.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then await new Promise(r => setTimeout(r, 160)) -> calls.length === 1

## Severity decides how assertively the notification announces

A screen reader interrupts for `alert` and waits for a quiet moment for `status`. Errors and warnings are worth interrupting for; a success or an informational note is not, and interrupting for those trains people to ignore the ones that matter.

- `error` and `warning` announce as alerts; every other type announces politely
  - new Subject({ type: "error", content: "m", appendTo: document.body }) captures err then new Subject({ type: "warning", content: "m", appendTo: document.body }) captures warn then new Subject({ type: "success", content: "m", appendTo: document.body }) captures ok then new Subject({ type: "info", content: "m", appendTo: document.body }) captures info -> err.elem.getAttribute("role") === "alert" && warn.elem.getAttribute("role") === "alert" && ok.elem.getAttribute("role") === "status" && info.elem.getAttribute("role") === "status"

- a falsy `timeout` means the notification stays until something dismisses it; a positive one dismisses it after that long
  - new Subject({ content: "stay", timeout: 0, appendTo: document.body }) captures kept then new Subject({ content: "go", timeout: 30, appendTo: document.body }) captures going then await new Promise(r => setTimeout(r, 90)) -> kept.elem.isConnected === true && going.elem.isConnected === false
