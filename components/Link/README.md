# Link

An anchor: the thing to use when pressing it goes somewhere. Doing something is a [Button](../Button/README.md). A link that should look like a button stays a Link with a Button's `variant`, so it is still an `<a>` with an `href`: it opens in a new tab, shows its address and has the browser's link menu.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Link: [action.icon-option](../../docs/USAGE_RULES.md#actions-and-navigation), [action.link-navigates](../../docs/USAGE_RULES.md#actions-and-navigation), [action.link-tooltip-off-in-nav](../../docs/USAGE_RULES.md#actions-and-navigation).

## Usage

```js
import { Link } from '@vanilla-bean/components';

new Link({ href: 'https://example.com/docs', target: '_blank', textContent: 'Read the docs' });

new Link({ href: '#/settings', textContent: 'Settings', icon: 'gear', variant: 'flat', tooltip: false });
```

## The tooltip

Every Link has a small tooltip with a link icon on hover or focus, marking it as a way off the page; a `tooltip` string or object adds text, and the icon stays. In a nav bar or any in-app navigation that is noise: give those links `tooltip: false` (`null` does the same, and setting it later removes the tooltip).

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | - | Where it goes |
| `textContent` | `string` | - | The link's text |
| `target` | `string` | - | The anchor's `target`, such as `'_blank'` |
| `variant` | `string` | `'link'` | `'link'`, or a Button's look: `'button'`, `'flat'`, `'chip'` or `'raised'` |
| `icon` | `string` | - | A Font Awesome icon name, drawn with the text; not an appended Icon |
| `tooltip` | `string\|object\|false\|null` | link icon | Tooltip text or [Tooltip](../Tooltip/README.md) options, merged onto the link icon; `false` or `null` for none |
| `tag` | `string` | `'a'` | The element |
