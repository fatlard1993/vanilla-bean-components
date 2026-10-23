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
	onItemPress: event => console.log('chose', event.detail.item.textContent),
});
```

Items are as a List's: a string, a component, or the options of the row itself.

## Choosing

A press on an item, or on anything inside one, fires `itemPress`, with `event.detail` holding the `item` (its `<li>`) and the press's `event`. A press on the gaps between items fires nothing, and neither does a row marked `role: 'presentation'` (a heading over a group).

The menu takes focus as one stop. The arrow keys move between items, wrapping round, Home and End go to the first and last, and Enter or Space presses the focused item: its own `onPointerPress` runs, and `itemPress` follows from that press.

## Options

| Option              | Type        | Default | Description                          |
| ------------------- | ----------- | ------- | ------------------------------------ |
| `items`             | `Array`     | -       | The items; reactive                  |
| `onItemPress`       | `Function`  | -       | Hears `itemPress`, an item pressed   |
| `ListItemComponent` | `Component` | -       | A component to render each item with |

## Events

- **`itemPress`** - An item was pressed; `event.detail` is `{ item, event }`: the item's `<li>` and the press's event

An item's own `onPointerPress` hears its press; `onItemPress` is the menu's one listener for any of them.
