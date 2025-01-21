# styled

Create a tagged Component class that will have scoped styles processed and injected into the page.

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

Supports all top-level components as named functions:

```js
const MyStyledComponent = styled.Button(
	({ colors }) => `
		background-color: ${colors.black};
		color: ${colors.lighter(colors.blue)};
	`,
);
```

Can be used as a tag function:

```js
const MyStyledComponent = styled.Icon`
	background-color: ${({ colors }) => colors.black};
`;
```

## appendStyles

Append a style tag with custom css onto the page at runtime

## postCSS

Process a piece of css text with [postcss](https://github.com/postcss/postcss), with the plugins: [autoprefixer](https://github.com/postcss/autoprefixer), and [postcss-nested](https://github.com/postcss/postcss-nested)

## themeStyles

Process a css decorator function, hydrating with theme and wrapping in optional scope

## shimCSS

Process a css decorator function, hydrating with theme, wrapping in optional scope, and post-processing with postCSS. Then appends the resulting css text a style tag to the page.
