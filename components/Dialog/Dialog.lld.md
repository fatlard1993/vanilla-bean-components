# Dialog

> ./Dialog.js

Native `<dialog>` element wrapper. The decision to use the native element rather than a div with ARIA roles means focus trapping, ESC-to-close, and return values are handled by the platform. The component's job is structure and timing, not reimplementing dialog semantics.

## Auto-open delays until the element is in the DOM

- `openOnRender` defaults to a small delay so the dialog is guaranteed to be attached before `showModal()` is called — opening before attachment fails silently
  - does setting openOnRender: false prevent the dialog from opening on its own?

## Invalid sizes and variants fail loudly rather than rendering in an unknown state

- an unrecognized size or variant throws at the point of assignment, not later when layout breaks
  - does an unrecognized size value throw?

## Header, body, and footer are stable references — options update them in place

- the structural elements are created once in `build()` and persist across option updates; assigning a new `header` value changes the header's content, not the dialog's structure
  - does updating the header option change the header's content without replacing the dialog structure?
