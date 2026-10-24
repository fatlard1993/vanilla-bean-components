# Form

Dynamic form component that generates labeled inputs from a configuration array and maintains reactive data state through an Oxject instance.

## Usage

```js
import { Form } from '@vanilla-bean/components';

const form = new Form({
	data: { username: '', age: 0 },
	inputs: [
		{ key: 'username', validate: value => (value ? null : 'Required') },
		{ key: 'age', parse: value => parseInt(value, 10) },
	],
});
```

## Options

| Option   | Type            | Default | Description                                                             |
| -------- | --------------- | ------- | ----------------------------------------------------------------------- |
| `inputs` | `Array<object>` | -       | Input configuration array; see shape below                              |
| `data`   | `object`        | `{}`    | Initial form data. Replaced with an `Oxject` instance on each `build()` |

### `inputs` entry shape

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `key` | `string` | required | Key into `options.data` for reading and writing the value |
| `label` | `string\|object` | auto | Label text. Defaults to a human-readable version of `key` (camelCase converted). Pass an object to forward options to `Label` |
| `InputComponent` | `Component class` | `Input` | Component class to instantiate. Can be `Select`, `ColorPicker`, or any component that accepts `value` and `onChange` |
| `onChange` | `Function` | `() => {}` | Called after the data context is updated with the new value |
| `parse` | `Function(value, input)` | `v => v` | Transforms the raw event value before storing it in `options.data` |
| `validate` | `Function\|Function[]` | - | `value => message`: what's wrong, or nothing. Shown below the field in the `danger` color and read out with it. A component with its own `validate()` (Input, Select, TagList) is given it and checks as it changes; any other is checked by `hasErrors()`. The same function can check the field on the server, as a `createStore` field's `validate` |
| `condition` | `Function(data)` | - | Hides the field while it returns false; a hidden field isn't validated |
| `...inputOptions` | `any` | - | Any additional options forwarded to the `InputComponent` constructor |

### `data` Oxject lifecycle

On `build()`, any existing `options.data` Oxject instance is destroyed and replaced with a new one wrapping the current data values. Each input subscribes to its key via `options.data.subscriber(key)` so the input value stays reactive. When a user changes a field, `options.data[key]` is updated immediately.

Access live form data at any time via `form.options.data`.

## Methods

```js
form.hasErrors(options?): boolean
// Checks every visible field's validate, after committing whatever is being typed in the focused field, showing each
// field's messages below it. Returns true if anything is wrong, false if the form is valid.

form.commitPendingEdit(): void
// Commits the focused field's typed value, as leaving the field would. hasErrors() calls it first.

form.inputElements: { [key]: InputComponent }
// Map of key → input component instances, available after build().
```

## Events

Individual inputs emit their own events (`onChange`, `onInput`). The Form does not emit top-level events. Listen on `form.options.data` or supply `onChange` per input config.

## Example

Form with mixed input types, custom parse, and submit validation:

```js
import { Form } from '@vanilla-bean/components';
import { Select } from '@vanilla-bean/components';
import { Button } from '@vanilla-bean/components';

const form = new Form(
	{
		data: { name: '', role: 'viewer', active: true },
		inputs: [
			{ key: 'name', validate: value => (value ? null : 'Name is required') },
			{ key: 'role', InputComponent: Select, options: ['viewer', 'editor', 'admin'] },
			{ key: 'active' },
		],
	},
	new Button({
		textContent: 'Submit',
		onPointerPress: () => {
			if (form.hasErrors()) return console.warn('Fix errors before submitting');
			console.log('Submitting:', { ...form.options.data });
		},
	}),
);
```

Type auto-detection applies: `name` (string) becomes a text input, `active` (boolean) becomes a checkbox, automatically.
