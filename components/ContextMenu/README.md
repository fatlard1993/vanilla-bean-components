# ContextMenu

A [Menu](../Menu/README.md) in a [Popover](../Popover/README.md) that opens at a point (a right-click, a long press) or under the button that asked for it.

## Usage

```js
import { ContextMenu } from '@vanilla-bean/components';

const menu = new ContextMenu({
	items: [
		{ textContent: 'Rename', onPointerPress: () => rename(card) },
		{ textContent: 'Delete', onPointerPress: () => remove(card) },
	],
});

card.on({
	targetEvent: 'contextmenu',
	callback: event => {
		event.preventDefault();
		menu.open({ x: event.clientX, y: event.clientY });
	},
});

// A touch screen has no right-click: a long press opens it at the same point
card.onLongPress(event => menu.open({ x: event.clientX, y: event.clientY }));
```

### Under a button

Given an `anchor`, the menu hangs under it, or over it when there's more room above, moved in from the viewport's edges. Opening it again from the same button closes it, so the button toggles its menu, and the button carries `aria-haspopup` and `aria-expanded`.

```js
const branchMenu = new ContextMenu({
	items: [
		{ heading: 'Switch to' },
		{ textContent: 'main', detail: 'up to date with origin', onPointerPress: () => checkout('main') },
		{ textContent: 'dev', detail: '3 ahead, 1 behind', onPointerPress: () => checkout('dev') },
	],
});

branchButton.onPointerPress(() => branchMenu.open({ anchor: branchButton }));
```

### Headings and details

- `{ heading }` names the group under it. It isn't an item: the arrow keys pass over it and pressing it does nothing.
- An item's `detail` shows as a second, smaller line under its label.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Array<object>` | - | Menu items, e.g. `{ textContent, detail, onPointerPress }`, and headings, `{ heading }`; reactive |
| `sticky` | `boolean` | `false` | Stay open after an item is chosen |
| `maxWidth` | `number` | `240` | Widest the menu may be |
| `reticle` | `boolean` | `true` | Mark the point a menu opened at |
| `outsideClose` | `boolean` | `true` | A press outside closes it |

Everything else is a Popover option.

## Behaviour

- Choosing an item runs its `onPointerPress`, then closes the menu (unless `sticky`).
- Escape and a press outside close it, and so does opening it again from the same anchor. Every way it closes announces `close`.
- It is placed by its measured size, so it flips away from the edges it would cross; nothing depends on how tall a row is.
- Focus moves to the first item on opening, so the arrow keys work at once, and returns to where it was on closing.
- It unfolds from the top as it opens and dims the page behind it. Opened at a point, it marks the point with a reticle until it closes; a menu under a button has none.

## Methods

```js
menu.open({ x, y }); // open at a point; without one it opens where it last was
menu.open({ anchor }); // open under an element, or close if it's already open from there
menu.close();
menu.isOpen; // whether it's open
```

A subclass can add its own marks at the point (a reticle, a highlight) by overriding `open` and `close` and calling `super`.
