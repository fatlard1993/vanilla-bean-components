# BottomSheet

A modal panel that slides up from the bottom of the screen, on the native `<dialog>`. Mounts to `document.body` by default. A downward drag on its handle past the threshold closes it.

## Usage

```js
import { BottomSheet, Component } from '@vanilla-bean/components';

const sheet = new BottomSheet({
	onClose: () => console.log('dismissed'),
	append: new Component({ tag: 'p', textContent: 'Sheet content here.' }),
});

sheet.open();
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `appendTo` | `Element` | `document.body` | Where to mount the sheet in the DOM |
| `autoOpen` | `boolean\|number` | `false` | Open a moment after rendering; a number is the delay in ms |
| `onClose` | `Function` | - | Hears `close`, however the sheet closed: `close()`, Escape, the dimmed page, a drag, navigating away |

All standard `Component` options are supported.

## Methods

```js
sheet.open();
// Slides the sheet up as a modal and moves focus to the first focusable thing in it.

sheet.close();
// Slides it out and announces close, if it was open. Focus goes back to where it was before opening.

sheet.isOpen;
// Whether it's open.
```

## Closing

Every way out ends on the dialog's own `close` event, so `onClose` hears each of them once:

- `close()`
- Escape, as for any modal dialog
- a press on the dimmed page above the sheet
- a drag down on the handle past the threshold (100px or a quarter of the sheet's height, whichever is smaller), with the mouse, a finger or a pen; a shorter drag springs back
- the page navigating away (`hashchange` or `popstate`)

The sheet stays in the page after closing, to open again; `destroy()` removes it.

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
			onPointerPress: () => sheet.close(),
		}),
	],
});

new Button({
	textContent: 'Open sheet',
	onPointerPress: () => sheet.open(),
	appendTo: document.body,
});
```
