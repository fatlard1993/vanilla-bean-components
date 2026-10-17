# ContextMenu

A [Menu](../Menu/README.md) in a [Popover](../Popover/README.md) that opens at a point: a right-click, a long press, or the button that asked for it.

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
		menu.show({ x: event.clientX, y: event.clientY });
	},
});
```

## Options

| Option         | Type            | Default | Description                                                  |
| -------------- | --------------- | ------- | ------------------------------------------------------------ |
| `items`        | `Array<object>` | -       | Menu items, e.g. `{ textContent, onPointerPress }`; reactive |
| `sticky`       | `boolean`       | `false` | Stay open after an item is chosen                            |
| `maxWidth`     | `number`        | `240`   | Widest the menu may be                                       |
| `outsideClose` | `boolean`       | `true`  | A press outside closes it                                    |

Everything else is a Popover option.

## Behaviour

- Choosing an item runs its `onPointerPress`, then closes the menu (unless `sticky`).
- Escape and a press outside close it.
- It is placed by its measured size, so it flips away from the edges it would cross; nothing depends on how tall a row is.
- Focus moves to the first item on opening, so the arrow keys work at once, and returns to where it was on closing.

## Methods

```js
menu.show({ x, y }); // open at a point; without one it opens where it last was
menu.hide();
```

A subclass can add its own marks at the point (a reticle, a highlight) by overriding `show` and `hide` and calling `super`.
