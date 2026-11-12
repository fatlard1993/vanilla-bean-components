# Keyboard

An on-screen keyboard: rows of buttons that announce each press, for a touch screen with no keyboard of its own or a remote control for one. It types into nothing itself; the app hears the key and decides what it does. It comes with a letter and a number layout, and is meant to be given layouts of its own.

## Usage rules

No [usage rule](../../docs/USAGE_RULES.md#every-component) bears on Keyboard yet.

## Usage

```js
import { Keyboard } from '@vanilla-bean/components';

const keyboard = new Keyboard({
	onKeyPress: ({ detail: { key } }) => {
		if (key === 'simple' || key === 'number') keyboard.setLayout(key);
		else if (key === 'backspace') field.value = field.value.slice(0, -1);
		else if (key.length === 1) field.value += key;
	},
});
```

Switching layouts is the app's to do: the `simple` and `number` keys (shown as "ABC" and "123") are keys like any other, and `setLayout(name)` (or setting `layout`) rebuilds the keys from that layout.

## Layouts and key definitions

A layout is a list of rows, each a list of key names. A key's name is its label and its class (`button.shift`); its definition in `keyDefinitions` can change what it sends (`key`), its label (`text`), its width (`class: 'u1_5'`, flex 1.25 to 7) and take any Button option, such as `icon`. A definition named `'^[0-9]$'`, anchored at both ends, applies to every key it matches. Your `keyDefinitions` are merged over the defaults, an entry of yours replacing that key's definition, so the default layouts keep their labels and widths; your `layouts` replace the defaults rather than adding to them.

```js
new Keyboard({
	layout: 'media',
	layouts: { media: [['volDown', 'mute', 'volUp']] },
	keyDefinitions: { volUp: { key: 'audio_vol_up', text: '', icon: 'volume-high' } },
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `layout` | `string` | `'simple'` | The layout shown; setting it rebuilds the keys |
| `layouts` | `object` | `simple`, `number` | Layout name to rows of key names |
| `keyDefinitions` | `object` | widths and labels for the defaults | Key name (or anchored pattern) to its definition, merged over the defaults |
| `tactileResponse` | `boolean` | `true` | A short vibration on each key down, where the device has one |

## Events

Each event's `event.detail` is `{ key, keyDefinition, target, event }`: what the key sends (its definition's `key`, or else its name), its definition, the Key component and the pointer event.

- **`keyDown`** - A key pressed down
- **`keyUp`** - A key let go
- **`keyPress`** - A key pressed and let go; a click or Enter on a focused key as well
