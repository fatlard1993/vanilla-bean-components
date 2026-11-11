# Button

A press: a `<button>` that runs `onPointerPress` for a click, a tap, or Enter and Space from the keyboard. It can carry an icon and a tooltip.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Button: [action.press-handler](../../docs/USAGE_RULES.md#actions-and-navigation), [action.primary-filled](../../docs/USAGE_RULES.md#actions-and-navigation), [action.icon-only-flat](../../docs/USAGE_RULES.md#actions-and-navigation), [action.icon-only-named](../../docs/USAGE_RULES.md#actions-and-navigation), [action.icon-option](../../docs/USAGE_RULES.md#actions-and-navigation), [action.label-wording](../../docs/USAGE_RULES.md#actions-and-navigation), [action.intent-is-effect](../../docs/USAGE_RULES.md#actions-and-navigation), [action.toggle-pressed](../../docs/USAGE_RULES.md#actions-and-navigation), [action.chip-is-choice](../../docs/USAGE_RULES.md#actions-and-navigation), [action.disabled-option](../../docs/USAGE_RULES.md#actions-and-navigation), [action.link-navigates](../../docs/USAGE_RULES.md#actions-and-navigation), [action.no-handbuilt-button](../../docs/USAGE_RULES.md#actions-and-navigation), [overlay.button-order](../../docs/USAGE_RULES.md#overlays-and-feedback).

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
- `'chip'` is a small outlined pill: for filters and choices, usually as a toggle (`pressed`).
- `'raised'` is bevelled and sinks as it's pressed.

`size: 'small'` makes any of them compact, for a row of minor actions (Refresh, Copy link). Reach for it, not `'chip'`, when what's wanted is a smaller button rather than a choice.

## Toggles

`pressed` makes a Button a toggle: `true` is on, `false` is off, and either is announced as `aria-pressed` and drawn in the selected role, whatever the variant. Left unset, the Button isn't a toggle at all. Pressing doesn't flip it; the app sets it from the state it toggles, so the two can't disagree.

```js
const mute = new Button({
	icon: 'volume-xmark',
	variant: 'flat',
	title: 'Mute',
	pressed: player.muted,
	onPointerPress: () => (mute.options.pressed = player.muted = !player.muted),
});

new Button({ textContent: 'Unread', variant: 'chip', pressed: filter.unread, onPointerPress: toggleUnread });
```

Show the on state with `pressed`, not with a class of the app's own, a swapped `intent`, or `disabled`: those look on without saying so.

## Intent

`intent` says what pressing it does, in the status role of that name: `'danger'` for a delete, `'success'` for a confirm, `'warning'` or `'info'`. A filled button takes the role as its fill; a flat or chip one as its text. The look stays the variant's.

```js
new Button({ textContent: 'Delete', intent: 'danger', onPointerPress: remove });
```

## Tooltips

`tooltip` shows its text on hover, after a moment, and at once when the button takes keyboard focus. It hides when the pointer leaves or focus moves on. `tooltip: false` (or `null`) removes it.

The tooltip is also what assistive technology hears: on an icon-only Button with no `title` or `aria-label` it is the Button's name, and on one with a label it describes it. So `{ icon: 'trash', tooltip: 'Delete' }` is a named button.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `textContent` | `string` | - | The label |
| `onPointerPress` | `Function` | - | Runs on a press, from a pointer or the keyboard |
| `icon` | `string` | - | A Font Awesome icon name, without `fa-` |
| `tooltip` | `string\|object\|false` | - | Tooltip text, or Tooltip options; names an icon-only button |
| `variant` | `string` | - | `'flat'`, `'chip'` or `'raised'` |
| `intent` | `string` | - | `'info'`, `'success'`, `'warning'` or `'danger'` |
| `pressed` | `boolean` | - | A toggle, on or off; unset, not a toggle |
| `size` | `string` | - | `'small'` for a compact button |
| `disabled` | `boolean` | - | Not pressable |
| `tag` | `string` | `'button'` | The element |
