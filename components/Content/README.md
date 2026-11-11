# Content

The part of a view that scrolls. It takes the room a [Toolbar](../Toolbar/README.md) or header leaves in a flex column and scrolls what doesn't fit, so the rest of the page stays put. `min-height: 0` is what lets a flex child scroll instead of stretching its parent.

```js
new Content({ padding: '0 12px', append: list });
```

| Option    | Type             | Default | Description                       |
| --------- | ---------------- | ------- | --------------------------------- |
| `padding` | `number\|string` | -       | Inner padding; a number is pixels |

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Content: [layout.view-shape](../../docs/USAGE_RULES.md#page-shell-and-layout), [layout.scroll-in-content](../../docs/USAGE_RULES.md#page-shell-and-layout).

## A reading column

`column: true` keeps what scrolls to a centered 960px column on a wide screen (or give a width: `column: 720`), the way a list of records or a document reads best. It's made of the side padding, so what's inside keeps its own margins and fills the column; on a narrow screen the sides keep a 12px gutter (set `--content-gutter` for another). Give the column's padding in CSS rather than through the `padding` option, which is inline and would override the column's sides. The scrollbar stays at the window's edge.
