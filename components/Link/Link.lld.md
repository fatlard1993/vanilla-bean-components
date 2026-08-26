# Link

> ./Link.js

Anchor element with optional button styling. The decision: `variant: 'button'` changes Link's appearance but not its element; it remains an anchor, preserving right-click, middle-click, open-in-tab, and keyboard semantics that a styled div cannot provide.

## Button variant changes appearance without surrendering anchor semantics

- a Link with `variant: 'button'` looks like a button but behaves like a link; it is still an anchor element, which is what provides right-click menus, keyboard focus, and tab semantics natively
  - does a Link with variant 'button' remain an anchor element?

## Tooltip includes a link icon automatically

- when a tooltip string is provided, the tooltip is configured with a link icon alongside the text
  - new Subject({ href: "#x", tooltip: "hello", textContent: "go" }) captures l -> l._tooltip.options.icon === "link" && l._tooltip.options.textContent === "hello"

## The link icon comes with the tooltip, however the tooltip was written

A link's tooltip is what tells a reader it leaves the page, so the icon is part of the default rather than something each call site remembers. A caller passing a plain string still gets it -- the default is merged onto their value, not replaced by it.

- the tooltip carries the link icon whether the caller passed a string or nothing at all
  - new Subject({ href: "https://example.com", textContent: "o", tooltip: "text tip", appendTo: document.body }) captures withString then new Subject({ href: "https://example.com", textContent: "o", appendTo: document.body }) captures byDefault -> withString.elem.querySelector("[popover]").style.fontSize === "12px" && byDefault.elem.querySelector("[popover]").style.fontSize === "12px" && withString.elem.querySelector("[popover]").textContent === "text tip"
