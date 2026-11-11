# Tooltip

A short hint that floats beside the element it explains. Apps almost never make one directly: give a Button or Link a `tooltip` option and it builds the Tooltip, opens it on hover and focus, and wires it up for assistive technology. See [Button's tooltips](../Button/README.md#tooltips). Make a Tooltip yourself only when you open and close it by hand, on something that isn't a Button or Link.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Tooltip: [action.icon-only-named](../../docs/USAGE_RULES.md#actions-and-navigation), [action.link-tooltip-off-in-nav](../../docs/USAGE_RULES.md#actions-and-navigation), [overlay.popover-close](../../docs/USAGE_RULES.md#overlays-and-feedback).

## Usage

The usual way, through a Button or Link:

```js
import { Button, Link } from '@vanilla-bean/components';

new Button({ icon: 'trash', tooltip: 'Delete' }); // names the icon-only button
new Button({ textContent: 'Save', tooltip: { textContent: 'Saves the draft', position: 'bottom' } });
new Link({ href: '#/games', textContent: 'Games', tooltip: false }); // a nav link, no tooltip
```

`tooltip` takes a string (its text) or an object of Tooltip options; `false` or `null` removes it.

Directly, append it to the element it explains; it is placed against its parent:

```js
import { Tooltip } from '@vanilla-bean/components';

const hint = new Tooltip({ textContent: 'Drag to reorder', position: 'bottom', appendTo: handle });

hint.open(); // at its position against handle
hint.close();
```

It is a [Popover](../Popover/README.md): it starts closed, `open({ x, y })` puts it at a point instead, and it is closed with `close()` or `destroy()`, never `elem.remove()`. A direct Tooltip is not tied to its element for assistive technology; that is what the `tooltip` option does.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `textContent` | `string` | - | The hint |
| `position` | `string` | `'topRight'` | `'center'`, `'top'`, `'bottom'`, `'left'`, `'right'`, `'topLeft'`, `'topRight'`, `'bottomLeft'` or `'bottomRight'`, against its parent. Anything else throws |
| `autoOpen` | `boolean\|number` | `false` | Open a moment after it's added to the page, as a Popover does |
| `icon` | `string` | - | A Font Awesome icon name beside the text |
| `onClose` | `Function` | - | Hears `close`, however it closed |

Popover's other options (`maxWidth`, `viewport`, `state`, ...) apply too.
