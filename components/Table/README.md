# Table

Data table component with configurable columns, client-side sorting, optional footer rows, and custom cell rendering.

## Usage

```js
import { Table } from 'vanilla-bean-components';

const table = new Table({
	data: [
		{ name: 'Alice', score: 42 },
		{ name: 'Bob', score: 17 },
	],
	columns: ['name', 'score'],
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Array<object>` | — | Array of row data objects. Reactive — reassigning `options.data` rebuilds the tbody |
| `columns` | `Array<string\|object>` | `[]` | Column definitions — see shape below |
| `footer` | `Array<string\|object>` | — | Footer row cells — same shape as columns. Strings are capitalized automatically |
| `sortProperty` | `string` | — | Key of the currently sorted column |
| `sortDirection` | `string` | — | `'asc'` or `'desc'` |
| `onSort` | `Function` | built-in | Called with `(property, direction)` when a sortable column header is clicked. Default sorts `options.data` in place using `orderBy` |

### `columns` entry shape

A column can be a plain string (key name, auto-capitalized as header label) or an object:

| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Property name on each row data object |
| `content` | `string\|Component` | Header cell content. Defaults to `capitalize(key)` |
| `sort` | `boolean` | Enables click-to-sort on this column's header with an animated sort icon |
| `dataColumn` | `object\|Function` | Options forwarded to each `<td>` component, or a `Function({ column, rowData, table })` returning those options |
| `...thOptions` | `any` | Any additional options forwarded to the `<th>` component (e.g., `style`, `className`) |

### `footer` entry shape

Same as columns: a string (rendered as capitalized text content) or an object with any `<td>` component options (e.g., `content`, `colspan`).

## Methods

Table does not expose imperative public methods. All mutations go through reactive options:

```js
// Replace data (rebuilds tbody)
table.options.data = newDataArray;

// Trigger a sort programmatically
table.options.sortProperty = 'score';
table.options.sortDirection = 'asc';
```

Internal references after build:

```js
table.thead; // Elem wrapping <thead>
table.tbody; // Elem wrapping <tbody>
table.tfoot; // Elem wrapping <tfoot>
```

## Events

Table does not emit custom events. Supply `onSort` to intercept sort interactions.

## Example

Sortable table with a custom column label, styled header, and footer totals:

```js
import { Table } from 'vanilla-bean-components';
import theme from 'vanilla-bean-components/theme';

const table = new Table({
	data: [
		{ item: 'Widget A', qty: 5, price: 9.99 },
		{ item: 'Widget B', qty: 12, price: 4.49 },
	],
	columns: [
		{ key: 'item', content: 'Product', sort: true },
		{ key: 'qty', content: 'Quantity', sort: true, style: { textAlign: 'right' } },
		{ key: 'price', content: 'Unit Price', style: { color: theme.colors.green } },
	],
	footer: [{ content: 'Totals:', colspan: 2 }, { content: '$59.83' }],
	appendTo: document.body,
});
```

Clicking a sortable column header toggles direction between `'desc'` and `'asc'`. The `onSort` default mutates `options.data` in place, triggering a reactive tbody rebuild.
