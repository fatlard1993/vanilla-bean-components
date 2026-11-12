# Label

A caption tied to a form field, wrapped round it. Reach for it whenever a field stands outside a [Form](../Form/README.md) (which labels its own fields): hand it the field and it sets the `<label for>` that names the field to assistive tech and focuses it on a press. Its `variant` places the text above the field, beside it, after it, over it, or as a heading that folds the field away.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Label: [form.every-field-labeled](../../docs/USAGE_RULES.md#forms), [form.checkbox-label-after](../../docs/USAGE_RULES.md#forms), [form.placeholder-not-label](../../docs/USAGE_RULES.md#forms).

## Usage

```js
import { Input, Label } from '@vanilla-bean/components';

const name = new Input({ value: '' });

new Label('Name', name);
new Label({ label: 'Remember me', variant: 'inline-after' }, new Input({ type: 'checkbox', value: false }));
```

A string first argument is the `label` text. An object `label` is the options of the `<label>` element itself.

## How a field gets its label

The Label ties its text to the field it holds, found in this order:

- `for`, when given: an id string, a component or an element. A control with no id is given one, so the tie holds.
- otherwise the first child, when it is a component or element (not text): `new Label('Name', input)`.
- otherwise the first component or element in `append`: `new Label({ label: 'Name', append: input })` reads the same.

A field made of parts (a [ColorPicker](../ColorPicker/README.md), a [TagList](../TagList/README.md)) names the part a label belongs on with a `labelTarget` getter, and the label points there rather than at the wrapper. A field you build from parts yourself can do the same.

A `<label for>` labels only a control (an input, a select, a button). A field the label is for that is not one but has a role, such as a [RadioButton](../RadioButton/README.md)'s `radiogroup`, is named by the label's text through `aria-labelledby` instead; an element with no role is left unnamed.

A placeholder is not a label: give the field a Label and keep the placeholder for a hint or an example.

## Variants

- `simple` (default): the text sits above the field.
- `inline`: the text sits to the left, on the same row; the field takes the rest of the width.
- `inline-after`: the text follows the control on the same row. This is the checkbox's label.
- `overlay`: on an `input`, the text sits inside the field while it is empty and unfocused, and moves above it on focus or once there is a value.
- `collapsible`: a bordered group whose label is a button (Tab, Enter and Space reach it, and it carries `aria-expanded`); pressing it hides everything but the label. `collapsed` sets or reads the state.

Changing `variant` later moves the existing text; it doesn't add a second one.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string\|object` | - | The text, or the `<label>` element's options |
| `variant` | `string` | `'simple'` | `'simple'`, `'inline'`, `'inline-after'`, `'overlay'` or `'collapsible'` |
| `for` | `string\|Component\|HTMLElement` | the field held | The field to tie the label to; see above |
| `collapsed` | `boolean` | - | `collapsible` only: folded shut |
| `tooltip` | `string\|object` | - | A tooltip on the whole Label (a [Tooltip](../Tooltip/README.md)); its text also describes the field (`aria-describedby`), beside any description the field has |
