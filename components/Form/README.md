# Form

Dynamic form component that generates labeled inputs from a configuration array and maintains reactive data state through a Context instance.

## Usage

```js
import { Form } from 'vanilla-bean-components';

const form = new Form({
	data: { username: '', age: 0 },
	inputs: [
		{ key: 'username', validations: [[/.+/, 'Required']] },
		{ key: 'age', parse: value => parseInt(value, 10) },
	],
});
```

## Options

| Option   | Type            | Default | Description                                                             |
| -------- | --------------- | ------- | ----------------------------------------------------------------------- |
| `inputs` | `Array<object>` | —       | Input configuration array — see shape below                             |
| `data`   | `object`        | `{}`    | Initial form data. Replaced with a `Context` instance on each `build()` |

### `inputs` entry shape

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `key` | `string` | required | Key into `options.data` for reading and writing the value |
| `label` | `string\|object` | auto | Label text. Defaults to a human-readable version of `key` (camelCase converted). Pass an object to forward options to `Label` |
| `InputComponent` | `Component class` | `Input` | Component class to instantiate. Can be `Select`, `ColorPicker`, or any component that accepts `value` and `onChange` |
| `onChange` | `Function` | `() => {}` | Called after the data context is updated with the new value |
| `parse` | `Function(value, input)` | `v => v` | Transforms the raw event value before storing it in `options.data` |
| `validations` | `Array` | — | Passed directly to the `InputComponent` (see Input validation format) |
| `...inputOptions` | `any` | — | Any additional options forwarded to the `InputComponent` constructor |

### `data` Context lifecycle

On `build()`, any existing `options.data` Context is destroyed and replaced with a new one wrapping the current data values. Each input subscribes to its key via `options.data.subscriber(key)` so the input value stays reactive. When a user changes a field, `options.data[key]` is updated immediately.

Access live form data at any time via `form.options.data`.

## Methods

```js
form.validate(options?): boolean
// Calls validate() on every input element that supports it.
// Returns true if any validation errors exist, false if the form is valid.

form.inputElements: { [key]: InputComponent }
// Map of key → input component instances, available after build().
```

## Events

Individual inputs emit their own events (`onChange`, `onInput`). The Form does not emit top-level events — listen on `form.options.data` or supply `onChange` per input config.

## Example

Form with mixed input types, custom parse, and submit validation:

```js
import { Form } from 'vanilla-bean-components';
import { Select } from 'vanilla-bean-components';
import { Button } from 'vanilla-bean-components';

const form = new Form(
	{
		data: { name: '', role: 'viewer', active: true },
		inputs: [
			{ key: 'name', validations: [[/.+/, 'Name is required']] },
			{ key: 'role', InputComponent: Select, options: ['viewer', 'editor', 'admin'] },
			{ key: 'active' },
		],
	},
	new Button({
		textContent: 'Submit',
		onPointerPress: () => {
			if (form.validate()) return console.warn('Fix errors before submitting');
			console.log('Submitting:', { ...form.options.data });
		},
	}),
);
```

Type auto-detection applies: `name` (string) becomes a text input, `active` (boolean) becomes a checkbox, automatically.
