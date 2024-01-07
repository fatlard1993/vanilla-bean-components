```js
new Whiteboard({
	width: '640px',
	height: '480px',
	color: '#BADA55',
	background: '#FFF',
	lineWidth: 3,
	lines: [
		{
			color: '#000',
			width: 6,
			line: [
				{ x: 100, y: 100 },
				{ x: 200, y: 200 },
			],
		},
	],
	onChange: event => {},
})
```
