# Button

A press: a `<button>` that runs `onPointerPress` for a click, a tap, or Enter and Space from the keyboard. It can carry an icon and a tooltip.

## Usage

```js
import { Button } from '@vanilla-bean/components';

new Button({ textContent: 'Save', onPointerPress: () => save() });
new Button({ icon: 'trash', tooltip: 'Delete', variant: 'flat', onPointerPress: () => remove() });
```

A `<button>` answers the keyboard by itself. Given another `tag`, a Button adds Enter and Space, so it presses the same way. A touch that turns into a scroll isn't a press.

## Variants

With no `variant` a Button is flat and filled, the library's quiet default.

- `'flat'` has no fill: for toolbars and icon buttons.
- `'chip'` is a small outlined pill: for filters and choices.
- `'raised'` is bevelled and sinks as it's pressed.

## Tooltips

`tooltip` shows its text on hover, after a moment, and at once when the button takes keyboard focus. It hides when the pointer leaves or focus moves on. `tooltip: false` removes it.

## Options

| Option           | Type                    | Default    | Description                                     |
| ---------------- | ----------------------- | ---------- | ----------------------------------------------- |
| `textContent`    | `string`                | -          | The label                                       |
| `onPointerPress` | `Function`              | -          | Runs on a press, from a pointer or the keyboard |
| `icon`           | `string`                | -          | A Font Awesome icon name, without `fa-`         |
| `tooltip`        | `string\|object\|false` | -          | Tooltip text, or Tooltip options                |
| `variant`        | `string`                | -          | `'flat'`, `'chip'` or `'raised'`                |
| `disabled`       | `boolean`               | -          | Not pressable                                   |
| `tag`            | `string`                | `'button'` | The element                                     |
