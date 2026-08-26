# Dialog

> ./Dialog.js

Native `<dialog>` element wrapper. The decision to use the native element rather than a div with ARIA roles means focus trapping, ESC-to-close, and return values are handled by the platform. The component's job is structure and timing, not reimplementing dialog semantics.

## Auto-open delays until the element is in the DOM

- `openOnRender` defaults to a small delay so the dialog is guaranteed to be attached before `showModal()` is called; opening before attachment fails silently
  - does setting openOnRender: false prevent the dialog from opening on its own?

## Invalid sizes and variants fail loudly rather than rendering in an unknown state

- an unrecognized size or variant throws at the point of assignment, not later when layout breaks
  - does an unrecognized size value throw?

## Header, body, and footer are stable references - options update them in place

- the structural elements are created once in `build()` and persist across option updates; assigning a new `header` value changes the header's content, not the dialog's structure
  - does updating the header option change the header's content without replacing the dialog structure?

## Buttons are declared in the shorthand that fits

A dialog's buttons are usually just labels, so a string is enough; a button that needs more than a label carries its own options object. Both forms sit in the same array rather than in separate options.

- a button entry may be a label string or an options object, and both render as buttons in order
  - new Subject({ buttons: ["OK", { textContent: "Cancel", addClass: "cancel" }], appendTo: document.body }) captures d then Array.from(d.elem.querySelectorAll("button")) captures btns -> btns.map(b => b.textContent).join() === "OK,Cancel" && btns[1].classList.contains("cancel")
- a dialog exposes the region its content belongs in, so callers append there rather than to the frame
  - new Subject({ appendTo: document.body }) captures d -> !!d.body && d.body.elem.tagName === "DIV"

- a dialog with no explicit parent attaches to the document body, since a modal belongs to the page rather than to its opener
  - new Subject({}) captures d -> d.elem.parentElement === document.body
- a numeric `openOnRender` is the delay in milliseconds; `true` takes the small default instead of waiting
  - new Subject({ openOnRender: 400 }) captures slow then new Subject({ openOnRender: true }) captures quick then await new Promise(r => setTimeout(r, 120)) then slow.elem.open captures slowEarly then quick.elem.open captures quickEarly then await new Promise(r => setTimeout(r, 400)) -> slowEarly === false && quickEarly === true && slow.elem.open === true
