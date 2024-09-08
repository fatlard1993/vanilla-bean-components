```js
new Input({
	type: 'text',
	value: 'value',
	validations: [[/.+/, 'This input is required']],
	onKeyUp: event => {},
	onInput: event => {},
	onChange: event => {},
});
```

```js
new Input({
	tag: 'textarea',
	syntaxHighlighting: true,
	language: 'json',
	value: '{\n\t"key": "value"\n}',
	validations: [
		[
			_ => {
				try {
					JSON.parse(_);
					return true;
				} catch {
					return false;
				}
			},
			'This input must be valid JSON',
		],
	],
	onKeyUp: event => {},
	onInput: event => {},
	onChange: event => {},
});
```

```js
new Input({
	tag: 'checkbox',
	value: true,
	validations: [[_ => !!_, 'Must be true']],
	onKeyUp: event => {},
	onInput: event => {},
	onChange: event => {},
});
```
