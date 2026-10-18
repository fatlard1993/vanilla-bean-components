# Notify

A toast: a short message that says what just happened. Its `type` (`info`, `success`, `warning`, `error`) picks its colour, its icon, how loudly a screen reader announces it, and how long it stays. Pressing it anywhere dismisses it.

## Usage

```js
import { Notify } from '@vanilla-bean/components';

new Notify({ type: 'success', content: 'Saved' });
new Notify({ type: 'error', content: 'Could not reach the server' });
```

Without an `x` and `y` it joins a stack in the bottom-right corner, the newest at the bottom; with them it's placed at that point.

## How long it stays

Info and success leave after four seconds. A warning or an error may need acting on, so it stays until pressed. A `timeout` given, zero included, overrides either. A pointer over the toast, or focus inside it, holds it open; once they leave it stays at least another moment and a half.

## Actions

`actions` puts buttons on the toast, for the one thing worth doing about the message: undo it, refresh for it, retry it.

```js
new Notify({
	type: 'warning',
	timeout: 10000,
	content: 'Deleted 3 bookmarks',
	actions: [{ textContent: 'Undo', onPress: () => restore(deleted) }],
});
```

- `onPress` gets `(notify, event)` and may be async. Once it settles the toast closes, unless it returns `false`.
- While one runs, the actions are disabled, so a second press can't run it twice.
- A throw keeps the toast open with its actions ready again, and is reported.
- An action without `onPress` just closes the toast, e.g. `{ textContent: 'Dismiss' }`.
- Each action is a flat [Button](../Button/README.md); any other Button option passes through.

## Options

| Option    | Type                | Default     | Description                                            |
| --------- | ------------------- | ----------- | ------------------------------------------------------ |
| `type`    | `string`            | `'success'` | `info`, `success`, `warning` or `error`                |
| `content` | `string\|Component` | -           | The message                                            |
| `timeout` | `number`            | by type     | Milliseconds before it leaves; `0` stays until pressed |
| `actions` | `Array<object>`     | -           | Buttons on the toast, `{ textContent, onPress }`       |
| `icon`    | `string`            | by type     | A Font Awesome icon name in place of the type's        |
| `x`, `y`  | `number`            | -           | Place it at a point instead of in the stack            |

Everything else is a [Popover](../Popover/README.md) option.
