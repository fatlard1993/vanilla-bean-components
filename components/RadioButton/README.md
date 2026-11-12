# RadioButton

A group of radio buttons built from a list of options, one of which is chosen. The group shares one generated `name`, so the browser keeps the choice exclusive. For most closed sets a [Select](../Select/README.md) or a row of `pressed` chips is the house choice.

## Usage rules

No [usage rule](../../docs/USAGE_RULES.md#every-component) bears on RadioButton yet; where it fits beside a Select or a row of chips is an [open question](../../docs/USAGE_RULES.md#open-questions).

## Usage

```js
import { RadioButton } from '@vanilla-bean/components';

const size = new RadioButton({
	label: 'Size',
	options: ['Small', { label: 'Medium', value: 2 }, 'Large'],
	value: 2,
	onChange: () => console.log(size.options.value),
});
```

A string option is both its label and its value; `{ label, value }` shows one and stores the other. Choosing an option sets `options.value` to that option's own value (a number stays a number) before the `change` event reaches the group, and setting `options.value` moves the selection. Each radio sits inside its own `<label>`, so its text is its name. The group is a `radiogroup`, and the arrow keys move the choice within it as the browser does for any radios sharing a name. Name the group with `label`, shown above the options and tied to the group by `aria-labelledby`, or by wrapping it in a [Label](../Label/README.md), which names it the same way.

## Options

| Option     | Type                    | Default | Description                                   |
| ---------- | ----------------------- | ------- | --------------------------------------------- |
| `label`    | `string`                | -       | The group's name, shown above the options     |
| `options`  | `Array<string\|object>` | -       | The choices: a string, or `{ label, value }`  |
| `value`    | `any`                   | -       | The chosen option's value; reactive both ways |
| `onChange` | `Function`              | -       | Hears `change` from any radio in the group    |
