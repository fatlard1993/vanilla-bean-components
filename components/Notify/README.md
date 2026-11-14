# Notify

A toast: a short message that says what just happened. Its `intent` (`info`, `success`, `warning`, `danger`, the status roles of the same names) picks its colour, its icon, how loudly a screen reader announces it, and how long it stays. Pressing it anywhere dismisses it, and however it leaves it announces `close`, as every overlay does, so `onClose` hears it.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Notify: [overlay.notify-failure](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.notify-error-stays](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.notify-intents](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.notify-undo](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.notify-placement](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.notify-not-progress](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.popover-close](../../docs/USAGE_RULES.md#overlays-and-feedback).

## Usage

```js
import { Notify } from '@vanilla-bean/components';

new Notify({ intent: 'success', content: 'Saved' });
new Notify({ intent: 'danger', content: 'Could not reach the server' });
```

Without an `x` and `y` it joins a stack in the bottom-right corner, the newest at the bottom; with them it's placed at that point. The stack keeps clear of a phone's home indicator. An app with a bar along the bottom edge lifts it above the bar with `--vbc-notify-offset`, e.g. `:root { --vbc-notify-offset: 56px; }` inside the media query where the bar shows.

## How long it stays

Info and success leave after four seconds. A warning or a danger may need acting on, so it stays until pressed. A `timeout` given, zero included, overrides either. A pointer over the toast, or focus inside it, holds it open; once they leave it stays at least another moment and a half.

Give a warning or a danger a timeout only when the toast isn't the one place the problem is shown:

- the app is already retrying, and will say when it gives up (a reconnect)
- the failure also shows where it happened (a field's message, an EmptyState)
- a later success replaces it (a save that went through on the next try)

A toast that is the only record of a failure stays until it's pressed.

## Where it shows

A toast shows beside what it's about, where the person is already looking.

- **Beside the control just pressed.** A toast made within three seconds of a press (by pointer or keyboard) shows beside that control. A save that answers "Saved" needs nothing more. The outcome of a toast's own action (Undo) shows where that toast was.
- **Beside an `anchor`.** `anchor: row` places it beside something else: the row a background sync changed, the field a paste filled.
- **In the corner stack.** `anchor: false`, or nothing pressed lately, or an anchor gone by the time it opens (the dialog it was in has closed): the bottom-right corner, newest at the bottom. A message nothing on screen caused (a server's push, a timer) passes `anchor: false`, so a press a moment earlier doesn't claim it. With a modal dialog open, the stack rises above the dialog's footer.
- **At a point.** `x` and `y` place it there.

Beside means the first side, below, right, above or left, with the room that covers no other control: the next row's button is what gets reached for next, and a press landing on the toast would only dismiss it. Where every side would cover something (a phone's list of full-width rows), it goes to the stack. Once something else is pressed, attention has moved on, so a toast still beside what was pressed before moves to the stack too.

A screen reader hears it the same wherever it shows.

```js
new Notify({ content: 'Saved' }); // beside the Save just pressed
new Notify({ intent: 'info', content: 'Synced 3 changes', anchor: list }); // beside the list it changed
new Notify({ intent: 'warning', content: 'Server restarting', anchor: false }); // nothing here caused it
```

## Repeats and a busy stack

The same message said again isn't shown twice. A toast with the same intent and the same words as one already showing in the same place (the stack, or beside the same anchor), and no actions, is counted on that one instead (×2, ×3), which pulses and starts its clock over; the new toast is destroyed unshown. A toast with actions is about one thing in particular (undo deleting _this_), so it's never merged. `notify.repeat()` counts one by hand.

The stack shows the newest three. Older ones fold behind a "+N more" button above them, and pressing it shows them all until the stack is down to three again.

## Actions

`actions` puts buttons on the toast, for the one thing worth doing about the message: undo it, refresh for it, retry it.

```js
// It's done, so success; longer than success's four seconds, to leave time to undo
new Notify({
	intent: 'success',
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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `intent` | `string` | `'success'` | `info`, `success`, `warning` or `danger` |
| `content` | `string\|Component` | - | The message |
| `timeout` | `number` | by intent | Milliseconds before it leaves; `0` stays until pressed |
| `actions` | `Array<object>` | - | Buttons on the toast, `{ textContent, onPointerPress }` |
| `icon` | `string` | by intent | A Font Awesome icon name in place of the intent's |
| `anchor` | `Element\|Component\|false` | the control just pressed | Show it beside this; `false` stacks it in the corner |
| `x`, `y` | `number` | - | Place it at a point instead |

Everything else is a [Popover](../Popover/README.md) option.
