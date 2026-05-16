# Link

> ./Link.js

Anchor element with optional button styling. The decision: `variant: 'button'` changes Link's appearance but not its element — it remains an anchor, preserving right-click, middle-click, open-in-tab, and keyboard semantics that a styled div cannot provide.

## Button variant changes appearance without surrendering anchor semantics

- a Link with `variant: 'button'` looks like a button but behaves like a link — it is still an anchor element, which is what provides right-click menus, keyboard focus, and tab semantics natively
  - does a Link with variant 'button' remain an anchor element?

## Tooltip includes a link icon automatically

- when a tooltip string is provided, the tooltip is configured with a link icon alongside the text
  - does a Link's tooltip show a link icon alongside the provided tooltip text?
