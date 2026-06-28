# Tooltip

> ./Tooltip.js

Positioned popover for explanatory text with nine validated position presets. The design decision: `position` is validated immediately on assignment; invalid values fail at the point of use, not when the tooltip is shown.

## Invalid position fails immediately, not on first show

- there are nine valid position values; anything else throws at assignment time, not at show time
- this surfaces misuse at development time rather than producing misaligned tooltips that only appear during interaction
  - does passing an invalid position value throw immediately?

## Changing position removes the previous position class

- only one position class is active at a time; switching position replaces, not accumulates
- callers can safely reassign position without manual cleanup
  - does changing position from one value to another leave only the new position class active?

## Show/hide animation is declared in CSS, not scheduled in JavaScript

- the transition is controlled by `:popover-open` and `@starting-style`; the component applies position classes and the platform animates
- this means animation timing is a CSS concern, not a component lifecycle concern
