# Toolbar

A row of controls (buttons, a search field, filters), centred on one line and wrapping when it runs out of room.

```js
new Toolbar({
	append: [new Button({ icon: 'plus', textContent: 'Add' }), new Input({ placeholder: 'Search' })],
});
```

| Option | Type             | Default | Description                                |
| ------ | ---------------- | ------- | ------------------------------------------ |
| `gap`  | `number\|string` | `12`    | Space between controls; a number is pixels |
| `wrap` | `boolean`        | `true`  | Wrap onto more lines when there isn't room |

Pair it with [Content](../Content/README.md) for the usual view: a toolbar that stays put over content that scrolls.
