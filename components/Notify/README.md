# Notify

A toast: a short message that says what just happened. Its `intent` (`info`, `success`, `warning`, `danger`, the status roles of the same names) picks its colour, its icon, how loudly a screen reader announces it, and how long it stays. Pressing it anywhere dismisses it.

## Usage

```js
import { Notify } from '@vanilla-bean/components';

new Notify({ intent: 'success', content: 'Saved' });
new Notify({ intent: 'danger', content: 'Could not reach the server' });
```

Without an `x` and `y` it joins a stack in the bottom-right corner, the newest at the bottom; with them it's placed at that point. The stack keeps clear of a phone's home indicator. An app with a bar along the bottom edge lifts it above the bar with `--vbc-notify-offset`, e.g. `:root { --vbc-notify-offset: 56px; }` inside the media query where the bar shows.

## How long it stays

Info and success leave after four seconds. A warning or a danger may need acting on, so it stays until pressed. A `timeout` given, zero included, overrides either. A pointer over the toast, or focus inside it, holds it open; once they leave it stays at least another moment and a half.

## Actions

`actions` puts buttons on the toast, for the one thing worth doing about the message: undo it, refresh for it, retry it.

```js
new Notify({
	intent: 'warning',
	timeout: 10000,
	content: 'Deleted 3 bookmarks',
	actions: [{ textContent: 'Undo', onPointerPress: () => restore(deleted) }],
});
```

- `onPointerPress` gets `(notify, event)` and may be async. Once it settles the toast closes, unless it returns `false`.
- While one runs, the actions are disabled, so a second press can't run it twice.
- A throw keeps the toast open with its actions ready again, and is reported.
- An action without `onPointerPress` just closes the toast, e.g. `{ textContent: 'Dismiss' }`.
- Each action is a flat [Button](../Button/README.md); any other Button option passes through.

## Options

| Option    | Type                | Default     | Description                                             |
| --------- | ------------------- | ----------- | ------------------------------------------------------- |
| `intent`  | `string`            | `'success'` | `info`, `success`, `warning` or `danger`                |
| `content` | `string\|Component` | -           | The message                                             |
| `timeout` | `number`            | by intent   | Milliseconds before it leaves; `0` stays until pressed  |
| `actions` | `Array<object>`     | -           | Buttons on the toast, `{ textContent, onPointerPress }` |
| `icon`    | `string`            | by intent   | A Font Awesome icon name in place of the intent's       |
| `x`, `y`  | `number`            | -           | Place it at a point instead of in the stack             |

Everything else is a [Popover](../Popover/README.md) option.
