```js
new Input({
	type: 'text',
	value: 'value',
	validations: [[/.+/, 'This input is required']],
	onKeyUp: event => {},
	onInput: event => {},
	onChange: event => {},
})
```

```js
new Input({
	tag: 'textarea',
	value: 'multiline\nvalue',
	validations: [[/.+/, 'This input is required']],
	onKeyUp: event => {},
	onInput: event => {},
	onChange: event => {},
})
```

```js
new Input({
	tag: 'checkbox',
	value: true,
	validations: [[_ => !!_, 'Must be true']],
	onKeyUp: event => {},
	onInput: event => {},
	onChange: event => {},
})
```