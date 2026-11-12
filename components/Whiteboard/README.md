# Whiteboard

A canvas to draw on with a mouse, pen or fingers, several at once. It hands back each finished stroke as a list of points, so a drawing can be saved and drawn again. Reach for it for sketches, notes or a signature; it has no shapes, undo or eraser of its own.

## Usage rules

No [usage rule](../../docs/USAGE_RULES.md#every-component) bears on Whiteboard yet.

## Usage

```js
import { Whiteboard } from '@vanilla-bean/components';

const board = new Whiteboard({
	width: '400px',
	height: '300px',
	color: '#333',
	lines: savedLines,
	onLine: ({ detail: { color, width, line } }) => savedLines.push({ color, width, line }),
});

board.clearCanvas();
```

`lines` is the whole picture: setting it clears what was drawn and draws the new set, so `[]` erases the canvas. Resizing the canvas blanks it and draws `lines` again. `readOnly` stops new strokes and keeps the drawing.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `width`, `height` | `string` | `'200px'` | Size of the canvas, in pixels |
| `background` | `string` | `'#FFF'` | Background color |
| `color` | `string` | `'#000'` | Color of new strokes |
| `lineWidth` | `number` | `3` | Width of new strokes |
| `lines` | `Array<object>` | - | Strokes to draw in place of what was drawn, each `{ color, width, line: [{ x, y }, ...] }` |
| `readOnly` | `boolean` | `false` | Stop new strokes |
| `drawThrottle` | `number` | from `lineWidth` | Milliseconds between sampled points; `0` samples every move |

## Methods

```js
board.clearCanvas(); // Erases the canvas and drops any stroke in progress
board.drawLine({ color, width, line }); // Draws one stroke
```

## Events

- **`line`** - A stroke ended; `event.detail` is `{ event, color, width, line }`, `line` its points
- **`draw`** - A segment was drawn mid-stroke; `event.detail` is `{ event, cap, from, to }`
