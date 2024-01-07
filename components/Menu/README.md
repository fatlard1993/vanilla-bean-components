```js
new Menu({
	items: [
		{ textContent: 'one', style: { textTransform: 'uppercase' } },
		'two',
		{ textContent: 'three', styles: ({ colors }) => `color: ${colors.red};` },
	],
	onSelect: event => {},
})
```
