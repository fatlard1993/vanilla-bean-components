# Popover

> ./Popover.js

Native popover element with edge-aware placement. The design decision: position is calculated at show time, not at construction — the popover adapts to wherever in the viewport it needs to appear, at the moment it appears.

## Placement adapts to viewport edges at the moment of showing

- when the popover would overflow an edge, the position flips; this calculation runs on each `show()` call so it stays accurate as the page scrolls or resizes

## autoOpen fires after a short delay, not immediately

- `autoOpen: true` queues `show()` after 200ms — failing immediately would break when the popover's anchor isn't yet in the DOM
  - does a popover with autoOpen not open synchronously on construction?
  - does cancelling the popover before 200ms prevent it from opening?

## Manual and auto state are distinct dismiss models

- `state: 'auto'` delegates dismiss to the platform's native light-dismiss; `state: 'manual'` requires explicit `close()` — the choice belongs to the use site
