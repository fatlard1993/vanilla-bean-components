# Menu

A list of choices, for the keyboard as much as the pointer. [ContextMenu](../ContextMenu/README.md) puts one in a [Popover](../Popover/README.md).

## Usage

```js
import { Menu } from '@vanilla-bean/components';

new Menu({
	items: [
		{ textContent: 'Rename', onPointerPress: () => rename(file) },
		{ textContent: 'Delete', onPointerPress: () => remove(file) },
	],
	onSelect: event => console.log('chose', event.detail.target.textContent),
});
```

Items are as a List's: a string, a component, or the options of the row itself.

## Choosing

A press on an item, or on anything inside one, fires `select`, with the press's event as `event.detail`. A press on the gaps between items fires nothing, and neither does a row marked `role: 'presentation'` (a heading over a group).

The menu takes focus as one stop. The arrow keys move between items, wrapping round, Home and End go to the first and last, and Enter or Space presses the focused item: its own `onPointerPress` runs, and `select` follows from that press.

## Options

| Option              | Type        | Default | Description                          |
| ------------------- | ----------- | ------- | ------------------------------------ |
| `items`             | `Array`     | -       | The items; reactive                  |
| `onSelect`          | `Function`  | -       | Hears `select`, an item chosen       |
| `ListItemComponent` | `Component` | -       | A component to render each item with |

## Events

- **`select`** - An item was chosen; `event.detail` is the press's event, its `target` inside the item
