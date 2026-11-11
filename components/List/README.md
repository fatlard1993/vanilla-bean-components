# List

A `<ul>` built from an array. Each item may be a string, a component or element, an array of content, or the options of the `<li>` itself, so data needs no reshaping first. Reach for it for any run of rows or entries; a list of choices to press is a [Menu](../Menu/README.md).

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on List: [structure.list-nostyle](../../docs/USAGE_RULES.md#structure-and-display).

## Usage

```js
import { List } from '@vanilla-bean/components';

const list = new List({
	noStyle: true,
	items: ['Milk', { textContent: 'Eggs', tooltip: 'A dozen' }],
});

list.options.items = ['Milk', 'Eggs', 'Bread'];
```

## Items

- A string, component, element or array is the `<li>`'s content.
- An object is the `<li>`'s own options (`textContent`, `tooltip`, `addClass`, `onPointerPress`, ...).
- With a `ListItemComponent`, on the list or on one item, each item is built as that component inside its `<li>`: an object item is its options, anything else its `content`. An item's `listItemOptions` go to the `<li>` around it.

Setting `items` again rebuilds the rows; `null` empties the list.

## noStyle

`noStyle: true` drops the bullets, the left padding and the line spacing, for a list laid out as rows, cards or chips. Use it rather than `list-style: none` by hand.

## Options

| Option              | Type        | Default | Description                              |
| ------------------- | ----------- | ------- | ---------------------------------------- |
| `items`             | `Array`     | -       | The items; reactive                      |
| `noStyle`           | `boolean`   | -       | No bullets, padding or list line spacing |
| `ListItemComponent` | `Component` | -       | A component to build each item with      |
| `tag`               | `string`    | `'ul'`  | The list element, such as `'ol'`         |
