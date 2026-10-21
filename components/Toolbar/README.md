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

## As a page's header

```js
new Toolbar({
	variant: 'bar',
	heading: field.name,
	append: [
		new Button({ icon: 'arrow-left', variant: 'flat', addClass: 'start', onPointerPress: back }),
		new Button({ icon: 'pen', variant: 'flat', onPointerPress: edit }),
	],
});
```

`heading` puts a title first that takes the room the controls leave and truncates rather than pushing them off (the whole title shows on hover), and `empty()` clears the controls but keeps it; anything with the class `start` (a back button) is drawn before it. `variant: 'bar'` is the top-bar look: flush to the edges, on the surface color, ruled off from what's below.
