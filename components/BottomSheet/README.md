# BottomSheet

Mobile bottom sheet with drag-to-close gesture. Mounts to `document.body` by default. Slides up from the bottom of the viewport; a downward drag past the threshold dismisses it.

## Usage

```js
import { BottomSheet } from '@vanilla-bean/components';

const sheet = new BottomSheet({
	onClose: () => console.log('dismissed'),
	append: new Component({ tag: 'p', textContent: 'Sheet content here.' }),
});

sheet.show();
```

## Options

| Option     | Type       | Default         | Description                                                       |
| ---------- | ---------- | --------------- | ----------------------------------------------------------------- |
| `appendTo` | `Element`  | `document.body` | Where to mount the sheet in the DOM                               |
| `onClose`  | `Function` | —               | Called when the sheet is dismissed — by drag or explicit `hide()` |

All standard `Component` options are supported.

## Methods

```js
sheet.show();
// Slides the sheet into view by adding the 'open' class.

sheet.hide();
// Slides the sheet out and calls options.onClose if set.
```

## Drag-to-close behavior

The top 60px of the sheet is the drag handle zone. A downward touch drag in this zone tracks the drag position in real time. Releasing past the threshold (120px or 25% of sheet height, whichever is smaller) dismisses the sheet via `hide()`.

Scroll position is respected: dragging is blocked while the sheet's content is scrolled away from the top, so normal scroll doesn't accidentally dismiss.

## Example

Sheet opened by a button, dismissed by drag or close button:

```js
import { BottomSheet, Button, Component } from '@vanilla-bean/components';

const sheet = new BottomSheet({
	onClose: () => console.log('closed'),
	append: [
		new Component({ tag: 'h3', textContent: 'Options' }),
		new Button({
			textContent: 'Close',
			onPointerPress: () => sheet.hide(),
		}),
	],
});

new Button({
	textContent: 'Open sheet',
	onPointerPress: () => sheet.show(),
	appendTo: document.body,
});
```
