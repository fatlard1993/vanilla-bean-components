# Popover

Content over the page, on the native popover API: placed at a point and kept on screen, or wherever its styles put it. Tooltip, [ContextMenu](../ContextMenu/README.md) and [Notify](../Notify/README.md) are Popovers.

## Usage

```js
import { Popover } from '@vanilla-bean/components';

const popover = new Popover({ content: 'Copied', autoOpen: false });

button.onPointerPress(event => popover.open({ x: event.clientX, y: event.clientY }));
```

It's appended to `document.body` and opens a moment after it's added, unless `autoOpen` is `false`; then `open()` opens it. A number for `autoOpen` is how long the moment is, in milliseconds.

## Placement

Given `x` and `y` (as options, or to `open()`), it sits just below and right of the point. Near the right edge it opens to the left of it instead, near the bottom above it, and a point off the viewport is moved onto it first. `maxWidth` and `maxHeight` size it, and the edges it keeps clear of are the `viewport` element's.

## Dismissing

With `state: 'manual'` (the default) it stays until `close()`. `outsideClose: true` also closes it on a press outside it, once that press has been handled, so a button that toggles it decides first. `state: 'auto'` hands dismissal to the browser: Escape, or a press elsewhere, and only one open at a time. However it closes, it announces `close`, so `onClose` hears every way out.

## Options

| Option         | Type                | Default      | Description                                                   |
| -------------- | ------------------- | ------------ | ------------------------------------------------------------- |
| `content`      | `string\|Component` | -            | What it shows                                                 |
| `autoOpen`     | `boolean\|number`   | `true`       | Open once it's added to the page; a number is the delay in ms |
| `onClose`      | `Function`          | -            | Hears `close`, however it closed                              |
| `x`, `y`       | `number`            | -            | The point to place it at                                      |
| `maxWidth`     | `number`            | `264`        | Widest it may be, in pixels                                   |
| `maxHeight`    | `number`            | `132`        | Tallest it may be, in pixels                                  |
| `outsideClose` | `boolean`           | `false`      | A press outside closes it                                     |
| `state`        | `string`            | `'manual'`   | `'manual'` or `'auto'`, the native popover state              |
| `viewport`     | `HTMLElement`       | the document | The element whose edges it keeps inside                       |
| `icon`         | `string`            | -            | A Font Awesome icon name beside the content                   |

## Methods

```js
popover.open({ x, y, maxWidth?, maxHeight? }?) // Opens it, placed at the point when one is given
popover.close()                                  // Closes it, announcing close if it was open
popover.isOpen                                   // Whether it's open
```
