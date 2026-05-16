# Whiteboard

> ./Whiteboard.js

Multi-touch drawing canvas that tracks each pointer independently. The design decision: draw throttle adapts to brush size — thicker lines need fewer intermediate points to look smooth, so the throttle rate derives from `lineWidth` rather than being a fixed value.

## Each pointer draws an independent line

- two simultaneous touches produce two independent strokes; neither interferes with the other
- the whiteboard tracks each active pointer by its ID
  - does a second finger touching the canvas start a separate line from the first?

## Draw throttle rate adapts to line width — no separate configuration needed

- the throttle delay is derived from `lineWidth + 3` (clamped to a range) — thicker lines are visually coarser and tolerate a longer delay
- callers set `lineWidth` and the draw rate adjusts automatically; they do not configure throttle separately
- explicitly setting `drawThrottle` overrides the derived rate when the default does not fit the use case

## Completed strokes are emitted as complete lines, not as individual points

- when a pointer lifts, the full array of points recorded during that stroke is emitted as a line event
- callers receive whole lines for persistence or replay, not a stream of coordinate events
  - does lifting a pointer emit all the points recorded during that stroke?

## readOnly prevents new strokes without clearing the canvas

- existing content remains visible; only new pointer interactions are blocked
- the whiteboard is non-destructive in read-only mode — content survives the mode switch
  - does enabling readOnly prevent a new stroke from starting while preserving existing content?

## clearCanvas wipes content without removing the element

- `clearCanvas()` clears the 2D context and resets stroke state
- the canvas element itself remains in the DOM, reusable for new drawing
  - does clearCanvas produce a blank canvas without removing it from the page?
