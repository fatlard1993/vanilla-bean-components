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
| `type` | `string` | auto-detected | Input type (the list is `input.optionEnum('type')`). Auto-detected from value: `number` → `'number'`, `boolean` → `'checkbox'`, `string` → `'text'` |
| `value` | `any` | `''` | Initial value. Setting `options.value` reactively updates the element |
| `placeholder` | `string` | `''` | Placeholder text |
| `autocomplete` | `string` | `'off'` | Native autocomplete attribute |
| `autocapitalize` | `string` | `'off'` | Native autocapitalize attribute |
| `autocorrect` | `string` | `'off'` | Native autocorrect attribute |
| `height` | `string\|number` | `'auto'` | Height for textarea. `'auto'` sizes to the content, wrapped lines included; a number sets `em` units |
| `suggestions` | `string[]` | - | Values the browser offers while typing, through a datalist kept in step with the option |
| `syntaxHighlighting` | `boolean` | - | Adds `syntaxHighlighting` class and Tab key indentation handling (textarea only) |
| `language` | `string` | - | Adds `language-<value>` class for Prism-compatible highlighting (requires `syntaxHighlighting`) |
| `validate` | `Function\|Function[]` | - | `value => message`: what's wrong, or nothing; see Validation below |
| `onFiles` | `Function` | - | Type `'file'`: `(files, event)` with the files picked, dropped or pasted that `accept` allows |
| `dropZone` | `Component\|HTMLElement` | - | Type `'file'`: an area that takes dropped and pasted files, is marked `drag-over` while dragged over, and opens the picker when pressed or on Enter |
| `onInput` | `Function` | - | Called on every keystroke with an enhanced event containing `.value` |
| `onChange` | `Function` | - | Called on change with an enhanced event containing `.value` |
| `onKeyUp` | `Function` | - | Called on keyup with an enhanced event containing `.value` |

### Supported `type` values

`button`, `checkbox`, `color`, `date`, `datetime-local`, `email`, `file`, `hidden`, `image`, `month`, `number`, `password`, `radio`, `range`, `reset`, `search`, `submit`, `tel`, `text`, `time`, `url`, `week`

### Validation

A validator is `value => message`: what's wrong with the value, in words, or nothing (`null`, `undefined`, `false`, `''`) when it's fine. Give one, or a list of them:

```js
validate: [
	value => (value ? null : 'This field is required'),
	value => (value.length >= 3 && value.length <= 20 ? null : 'Must be 3–20 characters'),
	value => value === 'forbidden' && 'That value is not allowed',
];
```

The field is checked as its value changes and whenever `validate()` is called. What's wrong is written below the field in the `danger` color and read out with it (`aria-describedby`); the field is marked `aria-invalid` and gets the `validation-errors` class. A value that passes clears all three.

It is the same shape every field takes: a [Form](../Form/README.md) field's `validate`, a TagList's, and a server `createStore` field's (see the [app kit](../../app/README.md)), so one function can check a field in the browser and in the store.

### Files

A file Input hands its files to `onFiles`, already filtered by `accept`, however they arrived: the picker, a drop, or a paste. With `onFiles` set, the field clears after each pick (once every change listener has had it), so choosing the same file again is still a change; a file field without `onFiles` keeps its selection for its own listeners or a form to read. Give it a `dropZone` for a larger target, and hide the field itself if the zone is the whole control:

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
input.validate({ value? }?): Array | undefined
// Checks options.value (or the value given) against options.validate, showing or clearing the message.
// Returns the messages if anything is wrong, undefined if nothing is.

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
	validate: value => (value ? null : 'Editor must not be empty'),
	onChange: ({ value }) => {
		editor.options.value = value;
		const errors = editor.validate();
		if (errors) console.warn(errors);
	},
	appendTo: document.body,
});
```

Tab and shift-Tab adjust indentation within the textarea when `syntaxHighlighting` is enabled.
