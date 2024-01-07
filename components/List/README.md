```js
new List({
	items: [
		{ textContent: 'one', style: { textTransform: 'uppercase' } },
		'two',
		{ textContent: 'three', styles: ({ colors }) => `color: ${colors.red};` },
	],
})
```
