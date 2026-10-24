# FormDialog

A [Dialog](../Dialog/README.md) holding a [Form](../Form/README.md), with Save, Delete and Cancel: the record dialog apps kept writing by hand.

## Usage

```js
import { FormDialog } from '@vanilla-bean/components';

new FormDialog({
	header: `Edit | ${category.name}`,
	inputs: [
		{ key: 'name', validate: value => (value ? null : 'Required') },
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
| `intro` | `string\|Component\|Array` | - | Content shown above the form; reactive |
| `formOptions` | `object` | - | Any further Form options |
| `FormComponent` | `Function` | `Form` | The Form class to build, for a form with fields and behaviour of its own |
| `onSave` | `Function` | - | `(data, dialog)` once the form is valid. Returning `false`, returning a failed request (a hypertether result with `status: 'error'`, or a `Response` that isn't ok), or throwing, keeps the dialog open; otherwise it closes |
| `onDelete` | `Function` | - | `(data, dialog)`. Its presence adds the Delete button |
| `confirmDelete` | `string\|object\|boolean` | - | Ask before deleting: the question, or `Dialog.confirm` options |
| `saveLabel`, `deleteLabel`, `cancelLabel` | `string` | `'Save'`, `'Delete'`, `'Cancel'` | Button labels |
| `size` | `string` | `'fit'` | As Dialog; `'fit'` is as tall as the form |

Everything else is a Dialog option. A subclass sets its own defaults in `static schema`, not `prepareOptions`: schema defaults are merged in before `prepareOptions` runs, so a value set there behind `...options` loses to them. Pass `buttons` for a button of your own. FormDialog knows its own by a `data-action` of `save`, `delete` or `cancel`, not by label, so mark the ones it should act on (`{ textContent: 'Record', 'data-action': 'save' }`); any other reaches `onButtonPress`.

## Behaviour

- **Save** runs `form.hasErrors()` first, which also commits what is being typed in the focused field; an invalid form stays as it is, with its errors showing.
- A failed request shows why above the buttons in the danger color (hypertether's `failureReason`: the server's `{ error }`, `{ message }` or text, else the status), and a throw shows its message; the next Save or Delete clears it. Returning `false` shows nothing, for an app that said why itself.
- While a save or delete is under way, Save and Delete are disabled, so a double press can't send it twice.
- **Enter** in a single-line field saves; in a textarea it is a new line, and a field that uses Enter itself (a TagList, an autocomplete) claims it with `preventDefault` so it doesn't save.
- **Delete** with `confirmDelete` asks over the form, in the `danger` intent; no leaves the form open as it was.

## Methods

```js
dialog.form; // the Form
await dialog.save(); // true once saved and closed
await dialog.delete(); // true once deleted and closed
```
