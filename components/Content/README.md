# Content

The part of a view that scrolls. It takes the room a [Toolbar](../Toolbar/README.md) or header leaves in a flex column and scrolls what doesn't fit, so the rest of the page stays put. `min-height: 0` is what lets a flex child scroll instead of stretching its parent.

```js
new Content({ padding: '0 12px', append: list });
```

| Option    | Type             | Default | Description                       |
| --------- | ---------------- | ------- | --------------------------------- |
| `padding` | `number\|string` | `0`     | Inner padding; a number is pixels |
