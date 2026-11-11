# Icon

A Font Awesome glyph, named as an option: `new Icon({ icon: 'star' })` gives the element its `fa-` classes, and changing `icon` swaps them cleanly. Use it for a glyph standing on its own, in a list row, a heading or a status. A Button's or Link's glyph is that component's own `icon` option, not an Icon appended inside it.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Icon: [action.icon-option](../../docs/USAGE_RULES.md#actions-and-navigation), [action.icon-meaning-named](../../docs/USAGE_RULES.md#actions-and-navigation).

## Usage

```js
import { Icon } from '@vanilla-bean/components';

new Icon({ icon: 'seedling' });
new Icon({ icon: 'lock', 'aria-label': 'Private' });
new Icon({ icon: 'spinner', iconAnimation: 'spin', textContent: 'Saving' });
```

## Decoration or meaning

An Icon with no text, no label and no control role is decoration: it carries `aria-hidden="true"`, as it should beside visible words. An Icon that means something by itself (a status, a lock) needs a name: an `aria-label`, or text beside it in the Icon (`textContent`). Either keeps it announced.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string` | - | A Font Awesome icon name, without the `fa-` prefix |
| `textContent` | `string` | - | Text after the glyph. With text the Icon is no longer icon-only (no `icon` class) and is announced |
| `animation` | `string` | - | A Font Awesome animation (`'spin'`, `'beat'`), without `fa-`, run on the whole element |
| `iconAnimation` | `string` | - | The same animations run on the glyph alone, leaving any text still |

Classes of your own, such as `fa-fw`, survive a change of `icon`.
