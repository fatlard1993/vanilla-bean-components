```js
new Form({
	data: { name: 'myName', url: 'myUrl', color: 'red' },
	inputs: [
		{ key: 'name', validations: [[/.+/, 'Required']] },
		{ key: 'url', validations: [[/.+/, 'Required']] },
		{ key: 'color', Component: ColorPicker },
	],
});
```
