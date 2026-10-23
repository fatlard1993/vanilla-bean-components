# Link

> ./Link.js

Anchor element with optional button styling. The decision: `variant: 'button'` changes Link's appearance but not its element; it remains an anchor, preserving right-click, middle-click, open-in-tab, and keyboard semantics that a styled div cannot provide.

## Button variant changes appearance without surrendering anchor semantics

- a Link with `variant: 'button'` looks like a button but behaves like a link; it is still an anchor element, which is what provides right-click menus, keyboard focus, and tab semantics natively
  - does a Link with variant 'button' remain an anchor element?

## A raised link is a key you press

A launcher's links are the content, pressed like keys, so they take the bevelled look Button calls `raised` while staying anchors.

- a Link with `variant: 'raised'` is an anchor drawn as a raised button
  - new Subject({ href: "#x", textContent: "go", variant: "raised" }) captures l -> l.elem.tagName === "A" && l.elem.classList.contains("variant-button") && l.elem.classList.contains("variant-raised")

## A link's target is an option like any other

- a target given as an option lands on the anchor, beside any other attributes
  - new Subject({ href: "#x", textContent: "go", target: "_blank", attributes: { rel: "noopener" } }) captures l -> l.elem.getAttribute("target") === "_blank" && l.elem.getAttribute("rel") === "noopener"

## Tooltip includes a link icon automatically

- when a tooltip string is provided, the tooltip is configured with a link icon alongside the text
  - new Subject({ href: "#x", tooltip: "hello", textContent: "go" }) captures l -> l._tooltip.options.icon === "link" && l._tooltip.options.textContent === "hello"

## The link icon comes with the tooltip, however the tooltip was written

A link's tooltip is what tells a reader it leaves the page, so the icon is part of the default rather than something each call site remembers. A caller passing a plain string still gets it -- the default is merged onto their value, not replaced by it.

- the tooltip carries the link icon whether the caller passed a string or nothing at all
  - new Subject({ href: "https://example.com", textContent: "o", tooltip: "text tip", appendTo: document.body }) captures withString then new Subject({ href: "https://example.com", textContent: "o", appendTo: document.body }) captures byDefault -> withString.elem.querySelector("[popover]").style.fontSize === "0.75em" && byDefault.elem.querySelector("[popover]").style.fontSize === "0.75em" && withString.elem.querySelector("[popover]").textContent === "text tip"

## A link can go without its tooltip

A nav bar's links are where the reader moves around the app, not ways off the page, so announcing each as a link is noise. `tooltip: false` leaves the Link with none, and turning it off later takes the one it had away.

- a Link given tooltip false has no tooltip, and one switched to false loses it
  - new Subject({ href: "#a", textContent: "a", tooltip: false, appendTo: document.body }) captures bare then new Subject({ href: "#b", textContent: "b", appendTo: document.body }) captures had then had.options.tooltip = false -> bare.elem.querySelector("[popover]") === null && had.elem.querySelector("[popover]") === null && had.elem.classList.contains("has-tooltip") === false
