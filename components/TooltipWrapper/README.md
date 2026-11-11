# TooltipWrapper

The base that gives Button, Link, Label and List items their `tooltip` option. Apps don't use it directly: they pass `tooltip` to a Button or Link, which is a TooltipWrapper. See [Button's tooltips](../Button/README.md#tooltips). Use TooltipWrapper itself only to give a tooltip to something that is none of those, such as a status line or a badge.

## Usage rules

No [usage rule](../../docs/USAGE_RULES.md#every-component) bears on TooltipWrapper yet: apps give a tooltip through the `tooltip` option of a Button or Link.

## Usage

```js
import { TooltipWrapper } from '@vanilla-bean/components';

const due = new TooltipWrapper({ textContent: 'Due Friday', tooltip: 'Set by your team lead' });

due.options.tooltip = false; // takes it away
```

It renders a `div` unless given a `tag`. The tooltip opens after the pointer has rested on it for 700ms, at once when it or a child takes focus, and closes when both the pointer and focus have left.

## Assistive technology

The tooltip is linked by id, so it is heard even while closed. An element with no name of its own (an icon-only one, with no text, `title` or `aria-label`) is named by it through `aria-labelledby`; one with a name is described by it through `aria-describedby`. Taking the tooltip away takes the link with it.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `tooltip` | `string\|object\|false\|null` | - | The tooltip's text, or its [Tooltip](../Tooltip/README.md) options (`position`, `icon`, ...); `false` or `null` for none |
| `icon` | `string` | - | A Font Awesome icon name for the element itself |
