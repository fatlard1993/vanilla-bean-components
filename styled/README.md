# styled

> Create Component classes with scoped styles that are automatically processed and injected into the page.

The `styled` system provides automatic CSS scoping, theme integration, and PostCSS processing for components. All styles are scoped using unique class identifiers to prevent CSS conflicts.

## Basic Usage

### Template Literal Syntax

```js
const StyledIcon = styled.Icon`
	background-color: ${({ colors }) => colors.black};
	width: 24px;
	height: 24px;

	&:before {
		${({ fonts }) => fonts.fontAwesomeSolid}
		content: "\f015";
	}
`;
```

### Function Syntax with Configuration

```js
const ConfiguredComponent = styled(
	Component,
	({ colors }) => `
    background-color: ${colors.black};
    color: ${colors.lighter(colors.blue)};
    padding: 12px;

    &:hover {
      background-color: ${colors.dark(colors.blue)};
    }
  `,
	{
		tag: 'section',
		role: 'banner',
		textContent: 'Default Text',
	},
);
```

### Named Component Shortcuts

All top-level components are available as named functions:

```js
const StyledButton = styled.Button`
	background-color: ${({ colors }) => colors.green};
	border-radius: 8px;
`;

const StyledInput = styled.Input`
	${({ fonts }) => fonts.kodeMono}
	border: 2px solid ${({ colors }) => colors.blue};
`;
```

**Note**: Template literal syntax creates components with default options (empty object). Use function syntax if you need to pass component configuration.

## Theme Integration

Style functions receive the complete theme object with colors, fonts, and pre-built component styles:

```js
const ThemedComponent = styled.Component`
	${({ button }) => button} /* Apply base button styles */
  ${({ fonts }) => fonts.kodeMono}
  background: ${({ colors }) => colors.darker(colors.blue)};
	color: ${({ colors }) => colors.mostReadable(colors.blue, [colors.white, colors.black])};
`;
```

### Runtime Style Override

Components can override or extend styles at runtime:

```js
const instance = new StyledComponent({
	styles: ({ colors }) => ({
		backgroundColor: colors.red,
		border: `2px solid ${colors.darker(colors.red)}`,
	}),
});
```

When `styles` option is an object, it's applied directly as inline styles. When it's a function, it generates scoped CSS.

## Component Inheritance

### Extending Styled Components

```js
const BaseButton = styled.Button`
	padding: 8px 16px;
	border-radius: 4px;
`;

const PrimaryButton = styled(BaseButton)`
	background: ${({ colors }) => colors.blue};
	color: ${({ colors }) => colors.white};
`;
```

### Full Component Functionality

Styled components inherit all functionality from their base component:

```js
const StyledInput = styled.Input`
	border: 2px solid ${({ colors }) => colors.blue};
`;

const instance = new StyledInput({
	value: 'initial value',
	onChange: event => console.log(event.value),
	placeholder: 'Enter text...',
});
```

## CSS Processing

### PostCSS Features

Nested CSS syntax is automatically processed:

```js
const NestedComponent = styled.Component`
	padding: 16px;

	& .child {
		margin: 8px;

		&:hover {
			background: ${({ colors }) => colors.blue};
		}
	}

	@media (max-width: 768px) {
		padding: 8px;
	}
`;
```

### Automatic Scoping

Each styled component gets a unique class identifier:

```js
const StyledDiv = styled(Component, () => `color: red;`);
const instance = new StyledDiv();

// Generated CSS will be scoped like:
// .a1b2c3d4 { color: red; }
// And the component will have class="a1b2c3d4"
```

## Performance & Load-Time Behavior

### Processing Pipeline

The styled system processes styles through several stages:

1. **Component Creation**: Generates unique class identifier using `classSafeNanoid()`
2. **Style Function Creation**: Template literals processed into theme functions
3. **Theme Integration**: Style functions receive complete theme object
4. **CSS Processing**: `shimCSS()` handles the processing pipeline
5. **PostCSS Processing**: Nested syntax and autoprefixing
6. **DOM Injection**: Final CSS injected via `appendStyles()`

### Load-Time Batching

Style processing depends on when components are created:

- **Document Complete**: Styles process immediately and return a Promise
- **Document Loading**: Styles are queued and processed on window `load` event
- **Queueing**: Multiple styles are batched together for efficient processing

```js
// If document is already loaded - processes immediately
const StyledComponent = styled(Component, () => 'color: red;');

// If document is still loading - queued for batch processing
const AnotherStyled = styled(Component, () => 'color: blue;');
```

## Conditional Styles

```js
const ConditionalComponent = styled.Component`
	padding: 12px;
	background: ${({ colors }) => colors.white};

	&.active {
		background: ${({ colors }) => colors.blue};
		color: ${({ colors }) => colors.white};
	}

	&.disabled {
		opacity: 0.5;
		pointer-events: none;
	}
`;

const instance = new ConditionalComponent({
	addClass: 'active',
	textContent: 'Active Button',
});
```

## Configuration-Only Components

Use `configured()` for components that need options but no styles:

```js
const ConfiguredComponent = configured(Component, {
	tag: 'article',
	role: 'main',
	textContent: 'Default Content',
});
```

## Utility Functions

### appendStyles(css, id?)

Directly inject CSS into the page:

```js
appendStyles(
	`
  .my-global-class {
    font-weight: bold;
    color: red;
  }
`,
	'my-global-styles',
);
```

### postCSS(styleText)

Process CSS with PostCSS plugins:

```js
const processedCSS = await postCSS(`
  .container {
    display: flex;

    .item {
      flex: 1;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
`);
```

### themeStyles({ styles, scope })

Generate themed CSS with optional scoping:

```js
const themedCSS = themeStyles({
	styles: ({ colors }) => `color: ${colors.white}; background: ${colors.black};`,
	scope: '.my-component',
});
// Returns: ".my-component { color: hsl(0, 0%, 90%); background: hsl(0, 0%, 10%); }"
```

### shimCSS(styleConfig)

Complete style processing pipeline:

```js
shimCSS({
	styles: ({ colors }) => `
    display: flex;
    background: ${colors.blue};

    .item {
      padding: 8px;
    }
  `,
	scope: '.my-scoped-component',
});
```

**Note**: In test environments, `shimCSS` may behave differently than in production. It always returns `undefined` during testing but handles the complete processing pipeline in production environments.

## Development Features

In development mode, components automatically get class names based on their constructor inheritance chain, making debugging easier:

```js
// In development, this component might have classes:
// "a1b2c3 MyCustomComponent Component Elem"
class MyCustomComponent extends Component {}
const styled = styled(MyCustomComponent /* styles */);
```

## Cleanup and Memory Management

Styled components automatically clean up their injected styles when disconnected from the DOM, preventing memory leaks and style pollution.
