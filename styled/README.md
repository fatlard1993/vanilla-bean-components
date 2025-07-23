# styled

> Create a Component class that will have scoped styles processed and injected into the page.

```js
const MyStyledComponent = styled(
	Component,
	({ colors }) => `
		background-color: ${colors.black};
		color: ${colors.lighter(colors.blue)};
	`,
);

const instanceOfMyStyledComponent = new MyStyledComponent({ textContent: 'one' });
const secondInstanceOfMyStyledComponent = new MyStyledComponent({
	textContent: 'two',
	styles: ({ colors }) => ({ color: colors.red }),
});
```

All top-level components are available as named functions:

```js
const MyStyledComponent = styled.Button(
	({ colors }) => `
		background-color: ${colors.black};
		color: ${colors.lighter(colors.blue)};
	`,
);
```

Tag function syntax is supported:

```js
const MyStyledComponent = styled.Icon`
	background-color: ${({ colors }) => colors.black};
`;
```

Configuration options can be set:

```js
const MyStyledComponent = styled(
	Component,
	({ colors }) => `
		background-color: ${colors.black};
		color: ${colors.lighter(colors.blue)};
	`,
	{
		tag: 'p',
		textContent: 'Default Text',
	},
);
```

Configuration options can be set without styles using the base function `configured`:

```js
const MyConfiguredComponent = configured(Component, {
	tag: 'p',
	textContent: 'Default Text',
});
```

## appendStyles

Append a style tag with custom css onto the page at runtime.

```js
appendStyles('div.cool { font-size: 16px; }');
```

## postCSS

Returns a piece of css text processed with [postcss](https://github.com/postcss/postcss), with the plugins: [autoprefixer](https://github.com/postcss/autoprefixer), and [postcss-nested](https://github.com/postcss/postcss-nested)

```js
const processedCSS = postCSS('div.cool { font-size: 16px; &:before { font-size: 6px } }');
```

## themeStyles

Returns a css string from a css decorator function, hydrating with theme and wrapping in optional scope.

```js
const themedCSS = themeStyles({ styles: ({ colors }) => `color: ${colors.black};`, scope: 'div.cool' });
```

## shimCSS

Process a css decorator function, hydrating with theme, wrapping in optional scope, and post-processing with postCSS. Then appends the resulting css text a style tag to the page.

```js
shimCSS({ styles: ({ colors }) => `color: ${colors.white};`, scope: 'div.cool' });
```
