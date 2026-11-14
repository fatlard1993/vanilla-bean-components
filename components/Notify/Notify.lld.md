# Notify

> ./Notify.js

Transient notification that self-destructs. The design choice is that click-to-dismiss is always on; every notification is interactive, not a passive message. The `intent` option drives icon and color selection so callers say what the message is about rather than manually picking icons; its values are the status color roles.

## Intent selects the appropriate icon

- callers pass `intent: 'danger'` and the component picks the matching icon; a custom `icon` option overrides this only when the standard mapping doesn't fit
  - new Subject({ intent: "success", textContent: "x" }) captures ok then new Subject({ intent: "danger", textContent: "x" }) captures bad then [ok, bad].map(n => (n.elem.className.match(/fa-[\w-]+/g) || []).join(" ")) captures icons -> icons[0].includes("fa-") && icons[1].includes("fa-") && icons[0] !== icons[1]

## Clicking anywhere on the notification dismisses it - the whole surface is the target

Notifications are temporary and should be easy to clear, so there is no separate close button to aim at.

- a click anywhere on the notification dismisses it, its body included, rather than only on a dedicated control
  - new Subject({ textContent: "hi", appendTo: document.body }) captures n then n.elem.isConnected captures shown then n.elem.click() -> shown === true && n.elem.isConnected === false

## Manual dismiss cancels a pending timeout - no duplicate destroy fires

- when a `timeout` is set and the user dismisses manually before it fires, the timer is cancelled so a second destroy call after the component is already gone cannot happen
  - new Array() captures calls then new Subject({ timeout: 50, appendTo: document.body, textContent: "hi" }) captures n then n.destroy = (...a) => { calls.push(1); return Object.getPrototypeOf(n).destroy.call(n, ...a); } then n.elem.click() then await new Promise(r => setTimeout(r, 160)) -> calls.length === 1

## Severity decides how assertively the notification announces

A screen reader interrupts for `alert` and waits for a quiet moment for `status`. Dangers and warnings are worth interrupting for; a success or an informational note is not, and interrupting for those trains people to ignore the ones that matter.

- `danger` and `warning` announce as alerts; every other intent announces politely
  - new Subject({ intent: "danger", content: "m", appendTo: document.body }) captures err then new Subject({ intent: "warning", content: "m", appendTo: document.body }) captures warn then new Subject({ intent: "success", content: "m", appendTo: document.body }) captures ok then new Subject({ intent: "info", content: "m", appendTo: document.body }) captures info -> err.elem.getAttribute("role") === "alert" && warn.elem.getAttribute("role") === "alert" && ok.elem.getAttribute("role") === "status" && info.elem.getAttribute("role") === "status"

- a falsy `timeout` means the notification stays until something dismisses it; a positive one dismisses it that long after it opens
  - new Subject({ content: "stay", timeout: 0, autoOpen: false, appendTo: document.body }) captures kept then new Subject({ content: "go", timeout: 30, autoOpen: false, appendTo: document.body }) captures going then kept.open() then going.open() then await new Promise(r => setTimeout(r, 90)) -> kept.elem.isConnected === true && going.elem.isConnected === false
- the timeout counts from opening, not from rendering: a toast waiting for its open() is still there to open
  - new Subject({ content: "later", timeout: 20, autoOpen: false, appendTo: document.body }) captures waiting then await new Promise(r => setTimeout(r, 60)) -> waiting.elem.isConnected === true

## Severity also decides how long it stays

A success or an informational note says something that needs no answer, so it leaves on its own. A warning or a danger may need acting on, so it waits to be tapped. A `timeout` given, zero included, overrides either.

- info and success dismiss themselves after four seconds; warning and danger stay until dismissed
  - new Subject({ intent: "info", autoOpen: false, appendTo: document.body }) captures info then new Subject({ intent: "danger", autoOpen: false, appendTo: document.body }) captures error -> info.options.timeout === 4000 && error.options.timeout === 0

## Toasts placed at no point stack in a corner

Without an `x` and `y`, a notification joins a stack in the bottom-right corner, the newest at the bottom, so several at once read as a list rather than piling on one another. When one leaves, the rest close the gap.

- notifications without a point stack, the newest nearest the edge, and close up when one goes
  - new Subject({ textContent: "older", autoOpen: false, appendTo: document.body }) captures older then older.open() then new Subject({ textContent: "newer", autoOpen: false, appendTo: document.body }) captures newer then newer.open() then Number(older.elem.style.bottom.match(/\d+/)[0]) captures olderBefore then newer.destroy() -> olderBefore > 18 && older.elem.style.bottom.startsWith("calc(18px ")
- a notification given a point is placed there and kept out of the stack
  - new Subject({ x: 40, y: 40, autoOpen: false, appendTo: document.body }) captures placed then placed.open() -> !placed.elem.classList.contains("stacked")


## An action is the one thing worth doing about the message

A toast that says something was deleted is the right place to undo it. The action runs once, however many times it's pressed, and the toast leaves when it's done; an action that reports it couldn't finish keeps the toast so it can be tried again.

- an action's handler gets the toast, and the toast closes once the handler settles; returning false keeps it
  - new Array() captures calls then new Subject({ content: "m", actions: [{ textContent: "Undo", onPointerPress: n => { calls.push(n); } }], appendTo: document.body }) captures n then n.elem.querySelector(".notify-actions button").click() then await new Promise(r => setTimeout(r, 20)) -> calls[0] === n && n.elem.isConnected === false
  - new Subject({ content: "m", actions: [{ textContent: "Retry", onPointerPress: () => false }], appendTo: document.body }) captures n then n.elem.querySelector(".notify-actions button").click() then await new Promise(r => setTimeout(r, 20)) -> n.elem.isConnected === true

## A hand on the toast holds it

- a pointer over the toast holds its timeout
  - new Subject({ content: "m", timeout: 30, autoOpen: false, appendTo: document.body }) captures n then n.open() then n.elem.dispatchEvent(new Event("pointerenter")) then await new Promise(r => setTimeout(r, 90)) -> n.elem.isConnected === true

## Beside actions, the message is its own element, whichever way it was given

- textContent and content both land in the message element
  - new Subject({ textContent: "T", actions: [{ textContent: "U" }], autoOpen: false, appendTo: document.body }) captures byText then new Subject({ content: "C", actions: [{ textContent: "U" }], autoOpen: false, appendTo: document.body }) captures byContent -> byText.elem.querySelector(".notify-message").textContent === "T" && byContent.elem.querySelector(".notify-message").textContent === "C"

## A hold is let go only when nothing else is holding

- focus moving between the toast's own buttons keeps it held
  - new Subject({ timeout: 30, autoOpen: false, actions: [{ textContent: "A" }, { textContent: "B" }], appendTo: document.body }) captures n then n.open() then n.elem.querySelectorAll("button")[0].focus() then n.elem.querySelectorAll("button")[0].dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: n.elem.querySelectorAll("button")[1] })) -> n._paused === true
- focus leaving the toast lets it go
  - new Subject({ timeout: 30, autoOpen: false, actions: [{ textContent: "A" }], appendTo: document.body }) captures n then n.open() then n.elem.querySelector("button").focus() then n.elem.querySelector("button").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null })) -> n._paused === false
- the pointer leaving while focus is inside keeps it held
  - new Subject({ timeout: 30, autoOpen: false, actions: [{ textContent: "A" }], appendTo: document.body }) captures n then n.open() then n.elem.querySelector("button").focus() then n.elem.dispatchEvent(new Event("pointerleave")) -> n._paused === true
- a toast with no clock is not paused by a hand over it
  - new Subject({ timeout: 0, autoOpen: false, appendTo: document.body }) captures n then n.open() then n.elem.dispatchEvent(new Event("pointerenter")) -> n._paused !== true

## The same message said again is counted, not stacked

An error that repeats (a retry failing, a save pressed twice) would otherwise fill the corner with copies, which is
why apps were giving their errors short timeouts. A stacked toast saying what one already showing says (the same
intent, the same words, no actions) is counted on that one instead, and its clock starts over. A toast with actions is
about one thing in particular, so two of them are never the same.

- a repeat isn't shown; the one showing counts it
  - new Subject({ intent: "danger", content: "Offline", autoOpen: false, appendTo: document.body }) captures first then first.open() then new Subject({ intent: "danger", content: "Offline", autoOpen: false, appendTo: document.body }) captures again then again.open() then new Subject({ intent: "danger", content: "Offline", autoOpen: false, appendTo: document.body }) captures third then third.open() -> again.elem.isConnected === false && third.elem.isConnected === false && first.elem.querySelector(".notify-count").textContent === "×3"
- other words, another intent, or actions make it a different toast
  - new Subject({ intent: "danger", content: "Offline", autoOpen: false, appendTo: document.body }) captures a then a.open() then new Subject({ intent: "warning", content: "Offline", autoOpen: false, appendTo: document.body }) captures b then b.open() then new Subject({ intent: "danger", content: "Deleted", actions: [{ textContent: "Undo" }], autoOpen: false, appendTo: document.body }) captures c then c.open() then new Subject({ intent: "danger", content: "Deleted", actions: [{ textContent: "Undo" }], autoOpen: false, appendTo: document.body }) captures d then d.open() -> b.elem.isConnected && c.elem.isConnected && d.elem.isConnected && a.elem.querySelector(".notify-count") === null
- a repeat starts the clock over
  - new Subject({ content: "Saved", timeout: 60, autoOpen: false, appendTo: document.body }) captures first then first.open() then await new Promise(r => setTimeout(r, 40)) then new Subject({ content: "Saved", timeout: 60, autoOpen: false, appendTo: document.body }) captures again then again.open() then await new Promise(r => setTimeout(r, 40)) -> first.elem.isConnected === true

## The stack shows the newest three

Errors stay until they're dismissed, so a burst of different ones would climb the screen. The newest three show; the
older fold behind a button that says how many, and pressing it shows them all until the stack is short again.

- a fourth toast folds the oldest away behind a count of them, and pressing it shows every one
  - new Array(1, 2, 3, 4).map(n => new Subject({ intent: "danger", content: `Error ${n}`, autoOpen: false, appendTo: document.body })) captures toasts then toasts.forEach(t => t.open()) then document.querySelector(".notify-more") captures more then toasts[0].elem.style.display captures oldest then more.textContent captures label then more.click() -> oldest === "none" && label === "+1 more" && toasts[0].elem.style.display === "" && toasts[3].elem.style.display === ""
- the button goes once the stack is short again
  - new Array(1, 2, 3, 4).map(n => new Subject({ intent: "danger", content: `Error ${n}`, autoOpen: false, appendTo: document.body })) captures toasts then toasts.forEach(t => t.open()) then toasts[3].destroy() -> document.querySelector(".notify-more") === null && toasts[0].elem.style.display === ""

## A toast shows beside what it is about

A message far from what caused it has to be found, and in the corner it can cover a dialog's way out. A toast given an `anchor` shows beside it, on the first side (below, right, above, left) with the room that covers no other control, since the next row's button is what gets reached for next and a press on the toast only dismisses it. Where every side would cover something, it goes to the corner stack. Left out, the anchor is the control pressed in the last few seconds, so the outcome of a press (Saved, Deleted, Copied) shows where the press was without the app asking. What nothing on screen caused (a server's message, a background failure) still stacks in the corner, as does a toast whose anchor has gone by the time it opens.

- a toast given an anchor shows beside it, out of the stack
  - new Array() captures held then document.createElement("button") captures b then document.body.append(b) then new Subject({ content: "Saved", anchor: b, autoOpen: false, appendTo: document.body }) captures n then n.open() -> n.elem.classList.contains("anchored") && !n.elem.classList.contains("stacked") && n.elem.style.top === "6px" && n.elem.style.bottom === "auto"
- a toast made just after a press shows beside the control pressed; one told anchor false stacks
  - new Array() captures held then document.createElement("button") captures b then document.body.append(b) then b.click() then new Subject({ content: "Copied", autoOpen: false, appendTo: document.body }) captures n then n.open() then new Subject({ content: "Server says hi", anchor: false, autoOpen: false, appendTo: document.body }) captures quiet then quiet.open() -> n._anchor === b && quiet.elem.classList.contains("stacked")
- an anchor gone from the page, or in a dialog that has closed, sends the toast to the stack
  - new Array() captures held then document.createElement("button") captures gone then document.createElement("dialog") captures d then document.createElement("button") captures inside then d.append(inside) then document.body.append(d) then new Subject({ content: "a", anchor: gone, autoOpen: false, appendTo: document.body }) captures n then n.open() then new Subject({ content: "b", anchor: inside, autoOpen: false, appendTo: document.body }) captures m then m.open() -> n.elem.classList.contains("stacked") && m.elem.classList.contains("stacked")
- a toast takes the first side that covers no other control (below, right, above, left), and the corner when none is clear
  - new Array() captures held then document.createElement("button") captures b then document.createElement("button") captures next then document.body.append(b, next) then b.getBoundingClientRect = () => ({ top: 100, bottom: 130, left: 10, right: 110, width: 100, height: 30 }) then next.getBoundingClientRect = () => ({ top: 136, bottom: 166, left: 10, right: 400, width: 390, height: 30 }) then new Subject({ content: "Saved", anchor: b, autoOpen: false, appendTo: document.body }) captures n then Object.defineProperties(n.elem, { offsetWidth: { value: 200 }, offsetHeight: { value: 40 } }) then n.open() -> n.elem.classList.contains("anchored") && n.elem.style.left === "116px" && n.elem.style.top === "95px"
  - new Array() captures held then document.createElement("button") captures b then document.createElement("button") captures everywhere then document.body.append(b, everywhere) then b.getBoundingClientRect = () => ({ top: 100, bottom: 130, left: 10, right: 110, width: 100, height: 30 }) then everywhere.getBoundingClientRect = () => ({ top: 0, bottom: 5000, left: 0, right: 5000, width: 5000, height: 5000 }) then new Subject({ content: "Saved", anchor: b, autoOpen: false, appendTo: document.body }) captures n then Object.defineProperties(n.elem, { offsetWidth: { value: 200 }, offsetHeight: { value: 40 } }) then n.open() then everywhere.remove() -> n.elem.classList.contains("stacked")
- the same message twice at one anchor is counted there; at another anchor it is its own toast
  - new Array() captures held then document.createElement("button") captures b then document.createElement("button") captures c then document.body.append(b, c) then new Subject({ content: "Saved", anchor: b, autoOpen: false, appendTo: document.body }) captures first then first.open() then new Subject({ content: "Saved", anchor: b, autoOpen: false, appendTo: document.body }) captures again then again.open() then new Subject({ content: "Saved", anchor: c, autoOpen: false, appendTo: document.body }) captures elsewhere then elsewhere.open() -> again.elem.isConnected === false && first.elem.querySelector(".notify-count").textContent === "×2" && elsewhere.elem.isConnected === true
- the outcome of a toast's own action shows where that toast was
  - new Array() captures held then document.createElement("button") captures b then document.body.append(b) then new Subject({ content: "Deleted", anchor: b, actions: [{ textContent: "Undo", onPointerPress: () => false }], autoOpen: false, appendTo: document.body }) captures n then n.open() then n.elem.querySelector(".notify-actions button").click() then new Subject({ content: "Restored", autoOpen: false, appendTo: document.body }) captures after then after.open() -> after._anchor === b

## The stack keeps clear of a dialog's way out

- with a modal dialog open, the stack rises above its footer
  - new Array() captures held then Object.defineProperties(document.documentElement, { clientWidth: { value: 1024, configurable: true }, clientHeight: { value: 800, configurable: true } }) then document.createElement("dialog") captures d then document.createElement("div") captures f then f.className = "footer" then f.getBoundingClientRect = () => ({ top: 500, right: 1024, bottom: 560, left: 0 }) then d.append(f) then document.body.append(d) then d.setAttribute("open", "") then new Subject({ content: "Saved", anchor: false, autoOpen: false, appendTo: document.body }) captures n then n.open() then n.elem.style.bottom captures lifted then d.remove() then delete document.documentElement.clientWidth then delete document.documentElement.clientHeight -> lifted.startsWith("calc(306px ")

## Once attention moves on, the toast moves out of the way

Beside its anchor a toast covers what's around it, and a warning stays until it's pressed. A press anywhere else means the person has moved on, so a toast still beside what they pressed before goes to the corner stack, where it waits without covering anything.

- a press elsewhere sends an anchored toast to the stack; a press on its own anchor leaves it
  - new Array() captures held then document.createElement("button") captures b then document.createElement("button") captures other then document.body.append(b, other) then new Subject({ intent: "warning", content: "Deleted", anchor: b, autoOpen: false, appendTo: document.body }) captures n then n.open() then b.click() then n.elem.classList.contains("anchored") captures stayed then other.click() -> stayed === true && n.elem.classList.contains("stacked") && n.elem.style.top === "" && n.elem.isConnected
