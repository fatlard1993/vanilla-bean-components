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

## The position is measured out against the element it explains

A tooltip is a popover, in the top layer, where nothing is placed by its parent's box: a class alone put every preset in
the same place. Opened with no point of its own, the tooltip is placed from its parent's rect in viewport coordinates,
which a fixed popover follows whatever the page has scrolled, and kept on the screen. Opened at a point, it goes there,
as any popover does.

- opened with no point, a `bottom` tooltip sits just under its parent, where the parent is on the screen
  - new Subject({ textContent: "tip", position: "bottom", appendTo: document.body }) captures t then (document.body.getBoundingClientRect = () => ({ left: 100, top: 50, right: 200, bottom: 80, width: 100, height: 30 })) then t.open() then delete document.body.getBoundingClientRect -> t.elem.style.top === "82px" && t.elem.style.left === "150px"
- opened at a point, it goes to the point
  - new Subject({ textContent: "tip", position: "bottom", appendTo: document.body }) captures t then (document.documentElement.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1920, bottom: 1080 })) then t.open({ x: 10, y: 10 }) then delete document.documentElement.getBoundingClientRect -> t.elem.style.left === "22px" && t.elem.style.top === "22px"

## Show/hide animation is declared in CSS, not scheduled in JavaScript

The transition is controlled by `:popover-open` and `@starting-style`. The component places the tooltip and applies its position class; the platform animates. Animation timing is therefore a CSS concern rather than a component lifecycle one, which is why nothing here schedules it or waits on it.

## A tooltip is always identifiable as one

The `tooltip` class is what the stylesheet and any consumer selector key off, so it is added rather than assigned -- classes the caller passes come along with it instead of replacing it.

- every tooltip carries the `tooltip` class, and caller-supplied classes are added alongside it
  - new Subject({ textContent: "tip", addClass: "mine", appendTo: document.body }) captures t -> t.elem.classList.contains("tooltip") && t.elem.classList.contains("mine")

## A tooltip is as tall as its text

A tooltip lets the pointer through, so nothing can scroll it: the height cap a popover is placed with would hide the end of a long hint behind a scrollbar no one can use. Its placement is still a popover's; only the cap is dropped.

- placed at a point, a tooltip has no maximum height
  - new Subject({ textContent: "tip", appendTo: document.body }) captures t -> (t.edgeAwarePlacement({ x: 10, y: 10 }), t.elem.style.maxHeight === "none")

## A tooltip wraps its text, whatever it sits in

A tooltip is a child of the element it explains, so it inherits that element's text styles; a button keeps its label on one line and centered, and a tooltip that inherited that would run its sentence out sideways behind a scrollbar no one can use. It wraps and aligns as prose does, which is a stylesheet's concern: nothing here runs to check it.
