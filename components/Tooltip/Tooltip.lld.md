# Tooltip

> ./Tooltip.js

Positioned popover for explanatory text with nine validated position presets. The design decision: `position` is validated immediately on assignment; invalid values fail at the point of use, not when the tooltip is shown.

## Invalid position fails immediately, not on first show

Surfacing misuse at development time beats producing misaligned tooltips that only appear during interaction.

- there are nine valid position values; anything else throws at assignment time, not at show time
  - does passing an invalid position value throw immediately?

## Changing position removes the previous position class

Callers can reassign `position` freely without cleaning up after the previous value.

- only one position class is active at a time; switching position replaces, not accumulates
  - does changing position from one value to another leave only the new position class active?

## Show/hide animation is declared in CSS, not scheduled in JavaScript

The transition is controlled by `:popover-open` and `@starting-style`. The component's only part is applying position classes; the platform animates. Animation timing is therefore a CSS concern rather than a component lifecycle one, which is why nothing here schedules it or waits on it.

## A tooltip is always identifiable as one

The `tooltip` class is what the stylesheet and any consumer selector key off, so it is added rather than assigned -- classes the caller passes come along with it instead of replacing it.

- every tooltip carries the `tooltip` class, and caller-supplied classes are added alongside it
  - new Subject({ textContent: "tip", addClass: "mine", appendTo: document.body }) captures t -> t.elem.classList.contains("tooltip") && t.elem.classList.contains("mine")
