# Whiteboard

> ./Whiteboard.js

Multi-touch drawing canvas that tracks each pointer independently. The design decision: draw throttle adapts to brush size; thicker lines need fewer intermediate points to look smooth, so the throttle rate derives from `lineWidth` rather than being a fixed value.

## Each pointer draws an independent line

Each active pointer is tracked by its own ID, which is what keeps concurrent strokes from being interleaved into one.

- two simultaneous touches produce two independent strokes; neither interferes with the other
  - new Subject({ drawThrottle: 0, appendTo: document.body }) captures w then w.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 })) then w.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 2, clientX: 40, clientY: 40 })) then Object.keys(w.pointers) captures both then w.elem.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 })) -> both.length === 2 && Object.keys(w.pointers).join() === "2"

Lifting one finger ends one stroke, not the gesture. The document listeners that track movement stay attached until the last pointer leaves, and a pointer that is no longer down contributes nothing even while they are.

- a pointer that has lifted stops contributing while the others keep drawing; the move listeners are released only when the last pointer leaves
  - new Array() captures drawn then new Subject({ drawThrottle: 0, appendTo: document.body }) captures w then w.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 })) then w.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 2, clientX: 40, clientY: 40 })) then document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 })) then w.drawLine = () => drawn.push(1) then w.elem.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 99, clientY: 99 })) then drawn.length captures fromLifted then w.elem.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 2, clientX: 99, clientY: 99 })) then drawn.length captures fromHeld then document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 2, clientX: 99, clientY: 99 })) then w.elem.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 2, clientX: 120, clientY: 120 })) -> fromLifted === 0 && fromHeld === 1 && drawn.length === 1
  - new Subject({ drawThrottle: 0, appendTo: document.body }) captures w then w.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 2, clientX: 5, clientY: 5 })) then w.drawEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 77, clientX: 9, clientY: 9 })) -> Object.keys(w.pointers).join() === "2"

## Draw throttle rate adapts to line width - no separate configuration needed

The delay is derived from the line width and clamped to a usable range: thicker lines are visually coarser, so they tolerate a longer gap between sampled points without looking angular. Callers set `lineWidth` and the draw rate follows; there is no separate throttle to configure.

- explicitly setting `drawThrottle` overrides the derived rate when the default does not fit the use case
  - new Array() captures derived then new Array() captures overridden then new Subject({ lineWidth: 20, appendTo: document.body }) captures a then a.drawEvent = () => derived.push(1) then a.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 0, clientY: 0 })) then [1, 2, 3, 4, 5].forEach(i => a.elem.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: i * 5, clientY: i * 5 }))) then new Subject({ lineWidth: 20, drawThrottle: 0, appendTo: document.body }) captures b then b.drawEvent = () => overridden.push(1) then b.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 0, clientY: 0 })) then [1, 2, 3, 4, 5].forEach(i => b.elem.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: i * 5, clientY: i * 5 }))) -> derived.length === 1 && overridden.length === 5

## Completed strokes are emitted as complete lines, not as individual points

Callers receive whole lines, suitable for persistence or replay, rather than a stream of coordinate events they would have to reassemble.

- when a pointer lifts, the full array of points recorded during that stroke is emitted as a line event
  - new Array() captures seen then new Subject({ appendTo: document.body, onLine: e => seen.push(e) }) captures w then w.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 1, clientY: 1 })) then document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 5, clientY: 5 })) then document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 9, clientY: 9 })) -> seen.length === 1 && Array.isArray(seen[0].detail.line)

## readOnly prevents new strokes without clearing the canvas

**browser:** true

Read-only mode is non-destructive: content survives the mode switch, so toggling it is safe at any time.

- existing content remains visible; only new pointer interactions are blocked
  - new Array() captures lines then new Subject({ appendTo: document.body, onLine: e => lines.push(e) }) captures w then w.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 })) then document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 40, clientY: 40 })) then document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 60, clientY: 60 })) then await new Promise(r => setTimeout(r, 80)) then [lines.length, w.elem.getContext("2d").getImageData(0, 0, w.elem.width, w.elem.height).data.reduce((n, v, i) => i % 4 === 3 && v !== 0 ? n + 1 : n, 0)] captures drawn then w.options.readOnly = true then await new Promise(r => setTimeout(r, 80)) then w.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 2, clientX: 10, clientY: 10 })) then document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 2, clientX: 40, clientY: 40 })) then document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 2, clientX: 60, clientY: 60 })) then await new Promise(r => setTimeout(r, 80)) -> drawn[0] === 1 && drawn[1] > 0 && lines.length === drawn[0] && w.elem.getContext("2d").getImageData(0, 0, w.elem.width, w.elem.height).data.reduce((n, v, i) => i % 4 === 3 && v !== 0 ? n + 1 : n, 0) === drawn[1]

## clearCanvas wipes content without removing the element

The canvas element itself stays in the DOM and is immediately reusable for new drawing.

- `clearCanvas()` has two separate jobs: erase the drawn content, and reset any stroke currently being tracked -- clearing the picture does not by itself imply an in-progress gesture is also reset, so both happen explicitly
  - new Array() captures cleared then new Subject({ appendTo: document.body }) captures w then w.canvas.clearRect = () => cleared.push(1) then w.clearCanvas() -> cleared.length === 1 && w.elem.isConnected
  - new Subject({ appendTo: document.body }) captures w then w.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 0, clientY: 0 })) then Object.keys(w.pointers).length captures during then w.clearCanvas() -> during === 1 && Object.keys(w.pointers).length === 0
