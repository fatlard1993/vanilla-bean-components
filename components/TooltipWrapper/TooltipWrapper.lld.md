# TooltipWrapper

> ./TooltipWrapper.js

Component that adds a tooltip to whatever it wraps. The Tooltip is created during the first `_setOption('tooltip', ...)` call, which runs during render, so it exists after construction but is only shown on hover after a 700ms delay.

## The tooltip exists after construction with a tooltip option

- the Tooltip component is created when the `tooltip` option is processed during render; after construction it exists as `this._tooltip`
  - does the Tooltip component exist after construction with a tooltip option?

## Hover shows after a delay - brief mouse-overs do not trigger the tooltip

- pointerover registers a 700ms timer; pointerout cancels it and hides immediately; hovering for longer than 700ms shows the tooltip
  - does hovering for longer than 700ms show the tooltip?
  - does leaving before 700ms prevent the tooltip from appearing?

## Cleanup removes the tooltip element - nothing outlives the component

- when the TooltipWrapper is destroyed, the Tooltip component is also destroyed and removed from the DOM
  - does destroying the wrapper also remove the tooltip from the DOM?

## The tooltip option takes a string or a full set of options

Most tooltips are a line of text, so a string is the common case and stays the shortest thing to write. Anything more -- extra classes, placement, markup -- is the same option carrying a full options object instead.

- a string `tooltip` becomes the tooltip's text; an object is used as the tooltip's own options
  - new Subject({ tooltip: "plain", appendTo: document.body }) captures s then new Subject({ tooltip: { textContent: "rich", addClass: "fancy" }, appendTo: document.body }) captures o then s.elem.querySelector("[popover]") captures plain then o.elem.querySelector("[popover]") captures rich -> plain.textContent === "plain" && rich.textContent === "rich" && rich.classList.contains("fancy")

## Moving the pointer away does not close a tooltip the keyboard is holding open

Hover and focus both open the tooltip, so the pointer leaving is only half the story: if the control still has focus, the tooltip is being held open by the keyboard and closing it would take away what a keyboard user is reading.

- `pointerout` hides the tooltip only when focus has also left the control
  - new Subject({ tooltip: "tip", appendTo: document.body }) captures held then new Subject({ tooltip: "tip", appendTo: document.body }) captures loose then held.elem.querySelector("[popover]") captures heldTip then loose.elem.querySelector("[popover]") captures looseTip then held.elem.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, clientX: 5, clientY: 5 })) then loose.elem.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, clientX: 5, clientY: 5 })) then await new Promise(r => setTimeout(r, 760)) then held.elem.focus() then held.elem.dispatchEvent(new PointerEvent("pointerout", { bubbles: true })) then loose.elem.dispatchEvent(new PointerEvent("pointerout", { bubbles: true })) -> heldTip.style.display === "block" && looseTip.style.display === "none"
