# FormDialog

A [Dialog](../Dialog/README.md) holding a [Form](../Form/README.md), with Save, Delete and Cancel: the record dialog apps kept writing by hand.

## Usage

```js
import { FormDialog } from '@vanilla-bean/components';

new FormDialog({
	header: `Edit | ${category.name}`,
	inputs: [
		{ key: 'name', validations: [[/.+/, 'Required']] },
		{ key: 'color', type: 'color' },
	],
	data: category,
	onSave: data => updateCategory(category.id, data),
	onDelete: () => deleteCategory(category.id),
	confirmDelete: `Delete "${category.name}"?`,
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `inputs` | `Array<object>` | - | Field definitions, as Form takes them |
| `data` | `object` | - | Initial values, as Form takes them |
| `formOptions` | `object` | - | Any further Form options |
| `onSave` | `Function` | - | `(data, dialog)` once the form is valid. Returning `false`, or throwing, keeps the dialog open; otherwise it closes |
| `onDelete` | `Function` | - | `(data, dialog)`. Its presence adds the Delete button |
| `confirmDelete` | `string\|object\|boolean` | - | Ask before deleting: the question, or `Dialog.confirm` options |
| `saveLabel`, `deleteLabel`, `cancelLabel` | `string` | `'Save'`, `'Delete'`, `'Cancel'` | Button labels |
| `size` | `string` | `'fit'` | As Dialog; `'fit'` is as tall as the form |

Everything else is a Dialog option. Pass `buttons` for a button of your own; Save, Delete and Cancel keep their meaning by label, and any other reaches `onButtonPress`.

## Behaviour

- **Save** runs `form.hasErrors()` first, which also commits what is being typed in the focused field; an invalid form stays as it is, with its errors showing.
- While a save or delete is under way, Save and Delete are disabled, so a double press can't send it twice.
- **Enter** in a single-line field saves; in a textarea it is a new line.
- **Delete** with `confirmDelete` asks over the form; no leaves the form open as it was.

## Methods

```js
dialog.form; // the Form
await dialog.save(); // true once saved and closed
await dialog.delete(); // true once deleted and closed
```
