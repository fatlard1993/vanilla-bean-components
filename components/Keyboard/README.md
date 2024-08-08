```js
new Keyboard({
	layout: 'demo',
	keyDefinitions: {
		space: { key: ' ', text: ' ', class: 'u6' },
	},
	layouts: {
		demo: [
			['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
			['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
			['z', 'x', 'c', 'v', 'b', 'n', 'm'],
			[',', '.', 'space', '!', '?'],
		],
	},
	onKeyDown: event => {},
	onKeyUp: event => {},
	onKeyPress: event => {},
});
```
