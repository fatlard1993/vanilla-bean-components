# Input

Versatile input component supporting all HTML input types, textarea with auto-height, syntax highlighting, validation, and automatic type detection from value type.

## Usage

```js
import { Input } from '@vanilla-bean/components';

const input = new Input({
	type: 'text',
	value: 'hello',
	placeholder: 'Enter text...',
	onChange: ({ value }) => console.log(value),
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `tag` | `string` | `'input'` | HTML tag: `'input'` or `'textarea'` |
| `type` | `string` | auto-detected | Input type (see `type_enum`). Auto-detected from value: `number` → `'number'`, `boolean` → `'checkbox'`, `string` → `'text'` |
| `value` | `any` | `''` | Initial value. Setting `options.value` reactively updates the element |
| `placeholder` | `string` | `''` | Placeholder text |
| `autocomplete` | `string` | `'off'` | Native autocomplete attribute |
| `autocapitalize` | `string` | `'off'` | Native autocapitalize attribute |
| `autocorrect` | `string` | `'off'` | Native autocorrect attribute |
| `height` | `string\|number` | `'auto'` | Height for textarea. `'auto'` sizes to the content, wrapped lines included; a number sets `em` units |
| `suggestions` | `string[]` | - | Values the browser offers while typing, through a datalist kept in step with the option |
| `syntaxHighlighting` | `boolean` | - | Adds `syntaxHighlighting` class and Tab key indentation handling (textarea only) |
| `language` | `string` | - | Adds `language-<value>` class for Prism-compatible highlighting (requires `syntaxHighlighting`) |
| `validations` | `Array` | - | Validation rules; see Validation section below |
| `onFiles` | `Function` | - | Type `'file'`: `(files, event)` with the files picked, dropped or pasted that `accept` allows |
| `dropZone` | `Component\|HTMLElement` | - | Type `'file'`: an area that takes dropped and pasted files, is marked `drag-over` while dragged over, and opens the picker when pressed or on Enter |
| `onInput` | `Function` | - | Called on every keystroke with an enhanced event containing `.value` |
| `onChange` | `Function` | - | Called on change with an enhanced event containing `.value` |
| `onKeyUp` | `Function` | - | Called on keyup with an enhanced event containing `.value` |

### Supported `type` values

`button`, `checkbox`, `color`, `date`, `datetime-local`, `email`, `file`, `hidden`, `image`, `month`, `number`, `password`, `radio`, `range`, `reset`, `search`, `submit`, `tel`, `text`, `time`, `url`, `week`

### Validation rule format

Each entry in `validations` is a tuple: `[test, message]`

- `test`: a `RegExp` tested against the value, or a `Function(value) => boolean` (truthy = error)
- `message`: a `string` or `Function() => string` describing the error

```js
validations: [
	[/.+/, 'This field is required'],
	[/^.{3,20}$/, 'Must be 3–20 characters'],
	[value => value === 'forbidden', 'That value is not allowed'],
];
```

Validation errors are applied to the underlying element via `setCustomValidity` and the `validationErrors` CSS class is toggled on the component.

### Files

A file Input hands its files to `onFiles`, already filtered by `accept`, however they arrived: the picker, a drop, or a paste. The field clears after each pick, so choosing the same file again is still a change. Give it a `dropZone` for a larger target, and hide the field itself if the zone is the whole control:

```js
const zone = new Component({ textContent: 'Drop a CSV here, or tap to choose' });

new Input({
	type: 'file',
	accept: '.csv,.json',
	style: { display: 'none' },
	dropZone: zone,
	onFiles: async ([file]) => importRows(await readFile(file)),
	appendTo: zone,
});
```

## Methods

```js
input.validate({ validations?, value? }): Array | undefined
// Runs validation rules. Returns array of error messages if invalid, undefined if valid.
// Calling with no args uses options.validations and options.value.

input.isDirty: boolean  // getter - true if current value differs from the initial value
```

## Events

Input components emit enhanced native events. All handlers (`onInput`, `onChange`, `onKeyUp`, etc.) receive a standard DOM event augmented with a `.value` property containing the current input value.

## Example

Textarea with auto-height and syntax highlighting:

```js
import { Input } from '@vanilla-bean/components';

const editor = new Input({
	tag: 'textarea',
	height: 'auto',
	syntaxHighlighting: true,
	language: 'javascript',
	value: 'const x = 1;',
	validations: [[/.+/, 'Editor must not be empty']],
	onChange: ({ value }) => {
		editor.options.value = value;
		const errors = editor.validate();
		if (errors) console.warn(errors);
	},
	appendTo: document.body,
});
```

Tab and shift-Tab adjust indentation within the textarea when `syntaxHighlighting` is enabled.
