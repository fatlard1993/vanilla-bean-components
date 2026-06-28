# Select

Select dropdown component extending Input, with dynamic option rendering and enhanced value access for both string and object-based option lists.

## Usage

```js
import { Select } from '@vanilla-bean/components';

const select = new Select({
	options: ['one', 'two', 'three'],
	value: 'two',
	onChange: ({ value }) => console.log('selected:', value),
});
```

## Options

Select inherits all options from `Input`. Key additions:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `Array<string\|object>` | — | List of selectable options. See shape below. Reactive: reassigning `options.options` rebuilds the `<option>` elements |
| `value` | `any` | — | Currently selected value. Matched against option `value` attributes |
| `onChange` | `Function` | — | Called with an enhanced event containing `.value` (the selected value string) on change |

All other `Input` options (`placeholder`, `validations`, `onInput`, etc.) are available but less commonly used with Select.

### `options` entry shape

Each entry in the `options` array is either:

- A **string**: used as both the `label` and `value` of the `<option>` element
- An **object**: spread directly onto the `<option>` element. Common fields:

| Field      | Type      | Description                               |
| ---------- | --------- | ----------------------------------------- |
| `value`    | `any`     | The value submitted/returned on selection |
| `label`    | `string`  | Display text shown in the dropdown        |
| `disabled` | `boolean` | Disables this specific option             |

```js
options: ['plain string', { label: 'Display Text', value: 42 }, { label: 'Unavailable', value: 'x', disabled: true }];
```

## Methods

```js
select.value          // getter — returns value, label, or textContent of the selected <option>
select.value = newVal // setter — sets elem.value directly

// Inherited from Input:
select.validate({ validations?, value? }): Array | undefined
select.isDirty: boolean
```

### Relationship to Input

`Select` extends `Input` and overrides `_setOption` only for the `options` key (to rebuild `<option>` children). All other option processing delegates to `Input`, which delegates to `Component`. The `tag` defaults to `'select'` rather than `'input'`. Type auto-detection from value type does not apply.

## Events

Select emits standard enhanced DOM events via inherited `Input` behavior. The `onChange` handler receives an event with `.value` set to the currently selected option's value.

## Example

Mixed string and object options with a numeric value, used inside a Form:

```js
import { Select } from '@vanilla-bean/components';

const select = new Select({
	options: [
		{ label: 'Low', value: 1 },
		{ label: 'Medium', value: 2 },
		{ label: 'High', value: 3 },
	],
	value: 2,
	onChange: ({ value }) => {
		select.options.value = value;
		console.log('Priority level:', select.value); // uses getter
	},
	appendTo: document.body,
});

// Swap the option list reactively at any time
select.options.options = ['alpha', 'beta', 'gamma'];
```
