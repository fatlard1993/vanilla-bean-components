# Card

A raised patch of the page holding one thing: a record in a list, a summary, a group of details. Apps were each drawing their own, and three of them gave theirs a colored left edge, so the stripe is an option.

```js
new Card(
	{ accent: theme.colors.green, onPointerPress: () => openField(field) },
	new Component({ textContent: field.name }),
	new Component({ textContent: `${field.acres} ac`, style: { color: theme.colors.muted } }),
);
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `accent` | `string\|object` | - | A color for a stripe down the left edge |
| `interactive` | `boolean` | when `onPointerPress` or an `href` is | Answer hover and focus, and show the pointer as a hand |

A card's look is quiet on purpose: a faint lift off the page, rounded corners, no border. Lay cards out in a flex column or grid with a gap; the card itself has no margin.

## A card that goes somewhere

A card that opens another view is a link, so it opens in a new tab and shows where it goes:

```js
new Card({ tag: 'a', href: `#/fields/${field.id}` }, new Component({ textContent: field.name }));
```

Keep `onPointerPress` for a card that does something in place (selects it, opens a dialog).
