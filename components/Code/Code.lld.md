# Code

> ./Code.js

Code display that automatically promotes from inline to block when the content spans multiple lines. The decision: callers pass code and the component determines the appropriate element; callers never choose between `code` and `pre>code` themselves.

## Multiline content renders as a block element without the caller specifying it

- content spanning multiple lines renders as a block element and single-line content renders inline; the caller passes code and never chooses between the two
  - does code with newlines render as a block (pre) rather than an inline element?
  - new Subject({ code: "one line", multiline: "auto", copyButton: false, language: "javascript" }) captures c -> c.elem.tagName === "CODE"

## Language class enables syntax highlighting libraries to identify the element

- the `language` option adds a `language-{name}` class; highlighting libraries target this class by convention
  - does the language option add an identifiable class to the code element?

## Copy confirms success visually - clipboard writes can fail silently

- the copy button shows a notification on success so the user knows the copy worked rather than discovering it failed on paste
  - new Subject({ code: "a\nb", copyButton: true, appendTo: document.body }) captures c then Object.defineProperty(window, "isSecureContext", { value: true, configurable: true }) then Object.defineProperty(navigator, "clipboard", { value: { writeText: () => {} }, configurable: true }) then c.elem.querySelector("button") captures btn then btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then btn.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) then await new Promise(r => setTimeout(r, 40)) -> document.body.textContent.includes("Copied text to clipboard!")
