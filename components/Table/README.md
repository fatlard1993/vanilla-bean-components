```javascript
new Table({
	data: [
		{ foo: true, bar: 'one', baz: 'wow' },
		{ foo: false, unused: 2, bar: 'two', baz: 'amazing' },
	],
	columns: [
		{ key: 'foo', label: 'Food for Thought', tag: 'th' },
		'bar',
		{ key: 'baz', content: 'A cool custom label' },
	],
	footer: [{ content: 'Total:', colspan: 2 }, 'who cares?'],
});
```
