# Button

> ./Button.js

Activatable element that unifies pointer and keyboard interaction under one handler. The design decision is that activation, regardless of whether it came from a click, touch, Space, Enter, or assistive technology, always routes through `onPointerPress`. Callers write one handler, not three. That handler listens for `click`, which is the one event every way of activating a native button produces; a press is the release, so a touch that turns into a scroll never presses.

## Keyboard and pointer share one activation handler

A native button turns its own Space and Enter into a click, so one click listener hears every input type. That platform behaviour needs a real key press, which a dispatched key event is not; the unit tests drive it through user-event, and the claims below cover the keyboard activation a Button on another tag gets added.

- the caller registers one `onPointerPress`, and a click invokes it
  - does clicking a Button invoke onPointerPress?

## A press is a click, so a scroll is not a press

- a touch that the browser hands to scrolling ends in `pointercancel` instead of a click, and does not invoke `onPointerPress`
  - new Array() captures calls then new Subject({ onPointerPress: () => calls.push("press"), appendTo: document.body }) captures b then b.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" })) then b.elem.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerType: "touch" })) then calls.length captures afterScroll then b.elem.click() -> afterScroll === 0 && calls.length === 1

## Caller-provided onKeyUp is preserved alongside activation logic

A native button activates on Space and Enter by itself, through its own click. A Button given another tag has no such behaviour, so it is made pressable (the button role, a tab stop, Enter and Space as a click), and that added handling must not displace a key handler the caller passed.

- a caller-provided `onKeyUp` runs alongside the added keyboard activation; registering both handlers does not suppress either
  - new Array() captures calls then new Subject({ tag: "div", onPointerPress: () => calls.push("press"), onKeyUp: () => calls.push("custom") }) captures b then document.body.append(b.elem) then b.elem.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true })) then b.elem.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true })) -> calls.includes("press") && calls.includes("custom")
- a Button on another tag is reached by Tab and announced as a button
  - new Subject({ tag: "div", appendTo: document.body }) captures b -> b.elem.tabIndex === 0 && b.elem.getAttribute("role") === "button"

## Tooltip is automatic - no setup beyond the tooltip option

- a `tooltip` option produces tooltip behaviour with no additional wiring at the call site
  - new Subject({ tooltip: "Save changes", appendTo: document.body }) captures b then b.elem.querySelector("[popover]") captures tip -> !!tip && tip.textContent === "Save changes"
  - new Subject({ tooltip: "Save changes", appendTo: document.body }) captures b then b.elem.querySelector("[popover]") captures tip then tip.style.display captures before then b.elem.dispatchEvent(new PointerEvent("pointerenter", { clientX: 10, clientY: 10 })) then await new Promise(r => setTimeout(r, 760)) -> before === "" && tip.style.display === "block"

## Only Space and Enter activate; every other key passes through

Keyboard activation is deliberately two keys, not "any key". A button that fired on arrows or Tab would steal navigation from the page around it, which is the failure that makes keyboard users avoid custom controls.

- Space and Enter invoke `onPointerPress`, as a click; other keys leave it uninvoked
  - new Array() captures fired then new Subject({ tag: "div", onPointerPress: e => fired.push(e.type), appendTo: document.body }) captures b then ["Enter", " ", "a", "Tab", "Escape"].forEach(key => { b.elem.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })); b.elem.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true })); }) -> fired.join() === "click,click"
- Enter presses as it goes down, once however long it's held; Space presses as it comes up, so a held Space doesn't scroll the page or repeat
  - new Array() captures fired then new Subject({ tag: "div", onPointerPress: () => fired.push(1), appendTo: document.body }) captures b then b.elem.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })) then b.elem.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", repeat: true, bubbles: true })) then b.elem.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true })) then fired.length captures afterDown then b.elem.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true })) -> afterDown === 1 && fired.length === 2

## A flat Button drops the raised look

Toolbars, chips and icon buttons sit inside something that already reads as a control; a raised, colored button there is noise, and apps were resetting it by hand.

- `variant: 'flat'` marks the button flat; the theme gives it a transparent background and no bevel
  - new Subject({ variant: "flat", textContent: "x", appendTo: document.body }) captures b -> b.elem.classList.contains("variant-flat") && b.elem.classList.contains("vbc-button")


## The raised look is a variant

The default button is flat and filled; the bevel that sinks as it's pressed is asked for.

- each variant marks the button for its look, and only one at a time
  - new Subject({ variant: "raised", appendTo: document.body }) captures b then b.options.variant = "chip" -> b.elem.classList.contains("variant-chip") && b.elem.classList.contains("variant-raised") === false

## A Button on another tag is disabled for real

A `<button>` is disabled by the browser; any other tag has to be told, and has to swallow its own clicks.

- a disabled `<button>` carries the disabled property, not an aria-disabled attribute
  - new Subject({ textContent: "b", disabled: true, appendTo: document.body }) captures b -> b.elem.disabled === true && !b.elem.hasAttribute("aria-disabled")
- a disabled non-button says so with aria-disabled and presses nothing; enabled again, it presses
  - new Array() captures presses then new Subject({ tag: "div", textContent: "d", disabled: true, onPointerPress: () => presses.push(1), appendTo: document.body }) captures d then d.elem.click() then presses.length captures whileDisabled then (d.options.disabled = false) then d.elem.click() -> d.elem.getAttribute("aria-disabled") === null && whileDisabled === 0 && presses.length === 1

## A toggle says it's on

Apps showed a toggle's state six ways (a class of their own, a swapped variant, intent or icon, disabled), and only
one said so to assistive technology. `pressed` is the one way: it is announced, and the theme draws it in the selected
role in every variant. It is set, never flipped by a press, so the button can't drift from the state it shows.

- `pressed` true or false is announced; unset, the button isn't a toggle
  - new Subject({ pressed: true, appendTo: document.body }) captures on then new Subject({ pressed: false, appendTo: document.body }) captures off then new Subject({ appendTo: document.body }) captures plain -> on.elem.getAttribute("aria-pressed") === "true" && off.elem.getAttribute("aria-pressed") === "false" && plain.elem.hasAttribute("aria-pressed") === false
- a press leaves it as it was, and taking the option away stops it being a toggle
  - new Subject({ pressed: false, appendTo: document.body }) captures b then b.elem.click() then b.elem.getAttribute("aria-pressed") captures afterPress then (b.options.pressed = undefined) -> afterPress === "false" && b.elem.hasAttribute("aria-pressed") === false

## A small button is a size, not a chip

Apps reached for the chip to get a smaller button, which made a Refresh look like a filter. `size: 'small'` is compact
in any variant, and leaves the chip for choices.

- `size: 'small'` marks the button small, beside its variant
  - new Subject({ size: "small", variant: "flat", textContent: "Refresh", appendTo: document.body }) captures b -> b.elem.classList.contains("size-small") && b.elem.classList.contains("variant-flat")
