# ColorPicker

A color chooser: a saturation and lightness area, a hue strip, a text field that takes any CSS color, and optional swatch buttons. Its value is always an `hsl()` string. It holds a value, so in a form it is a Form input (`InputComponent: ColorPicker`), not a picker placed beside the Form.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on ColorPicker: [form.value-components-in-form](../../docs/USAGE_RULES.md#forms).

## Usage

```js
import { ColorPicker, Form } from '@vanilla-bean/components';

new ColorPicker({
	value: '#3366cc',
	swatches: ['random', '#ff0000', 'green'],
	onChange: ({ value }) => setTagColor(value), // 'hsl(220, 60%, 50%)'
});

new Form({ data: tag, inputs: [{ key: 'color', InputComponent: ColorPicker }] });
```

## Value

`value` takes any CSS color (hex, a name, `rgb()`, `hsl()`) or `'random'`, and reads back as an `hsl()` string. A typed color counts once it parses: half-typed text is left as typed and changes nothing. A `'random'` swatch shows a cycling rainbow and picks a new random color each press.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `'#666'` | The color: any CSS color, or `'random'`; reactive |
| `swatches` | `Array<string>` | `[]` | Colors offered as buttons under the picker; `'random'` among them is a random-color button |
| `onChange` | `Function` | - | Hears `change`, a color chosen; `event.value` (and `event.detail.value`) is the `hsl()` string |

A Label given to a ColorPicker belongs to its text field.
