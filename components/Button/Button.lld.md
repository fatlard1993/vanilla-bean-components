# Button

> ./Button.js

Activatable element that unifies pointer and keyboard interaction under one handler. The design decision is that activation — regardless of whether it came from a click, touch, Space, or Enter — always routes through `onPointerPress`. Callers write one handler, not three.

## Keyboard and pointer share one activation handler

- Space and Enter activate the button the same way a click does; the caller registers one `onPointerPress` and it fires for all input types
  - does pressing Enter on a focused Button invoke onPointerPress?
  - does clicking a Button invoke onPointerPress?

## Caller-provided onKeyUp is preserved alongside activation logic

- a caller-provided `onKeyUp` runs alongside the built-in keyboard activation — registering both handlers does not suppress either
  - does providing a custom onKeyUp still trigger onPointerPress on Space/Enter?

## Tooltip is automatic — no setup beyond the tooltip option

- Button extends TooltipWrapper; a `tooltip` option produces tooltip behavior with no additional wiring
  - does a Button with a tooltip option show a tooltip on hover?
