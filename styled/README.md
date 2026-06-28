# styled

Create Component subclasses with scoped CSS: each `styled()` call generates a unique class, processes the theme, and injects a `<style>` element into `<head>`.

## Basic Usage

### Template Literal Syntax

Create styled components using template literals with theme integration:

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

Use function syntax when you need to pass component configuration options:

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

All top-level components are available as shorthand methods:

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

**Note**: Template literal syntax creates components with empty configuration. Use function syntax to pass component options.

## Theme Integration

Style functions receive the complete theme object containing colors, fonts, and component styles:

```js
const ThemedComponent = styled.Component`
	${({ button }) => button} /* Apply base button styles */
  ${({ fonts }) => fonts.kodeMono}
  background: ${({ colors }) => colors.darker(colors.blue)};
	color: ${({ colors }) => colors.mostReadable(colors.blue, [colors.white, colors.black])};
`;
```

### Runtime Style Override

Override or extend styles when creating component instances:

```js
const instance = new StyledComponent({
	styles: ({ colors }) => ({
		backgroundColor: colors.red,
		border: `2px solid ${colors.darker(colors.red)}`,
	}),
});
```

Object-based styles apply as inline styles. Function-based styles generate scoped CSS.

## Component Inheritance

### Extending Styled Components

Build component hierarchies by extending existing styled components:

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

### Template Literals with Any Styled Component

Template literal syntax works with any styled component, including those created with function syntax:

```js
const BaseComponent = styled(Component, () => 'color: red;');

// Extend any styled component with template literals
const ExtendedComponent = styled(BaseComponent)`
	background: ${({ colors }) => colors.blue};
	padding: 16px;
`;

// Use in class definitions for custom methods
class MyComponent extends (styled(BaseComponent)`
	font-weight: bold;
	border-radius: 4px;
`) {
	// Add custom methods here
}
```

### Component Functionality Inheritance

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

### Native CSS Nesting

Styles are injected as written, no transformation, no runtime compilation. VBC requires Chrome 112+, Firefox 117+, and Safari 16.5+, all of which support the `&` nesting syntax natively.

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

Each styled component receives a unique class identifier to prevent CSS conflicts:

```js
const StyledDiv = styled(Component, () => `color: red;`);
const instance = new StyledDiv();

// Generated CSS: .a1b2c3d4 { color: red; }
// Component class: "a1b2c3d4"
```

### Conditional Styles

Apply conditional styles using CSS classes and selectors:

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

## Performance

### Processing Pipeline

The styled system processes styles through this pipeline:

1. **Component Creation** - Generates unique class identifier via `classSafeNanoid()`
2. **Style Processing** - Converts template literals into theme functions
3. **Theme Application** - Injects complete theme object into style functions
4. **CSS Processing** - Processes styles through `shimCSS()` pipeline
5. **DOM Injection** - Injects final CSS via `appendStyles()`

### Load-Time Optimization

Style processing timing depends on document state:

| Document State      | Behavior                                   |
| ------------------- | ------------------------------------------ |
| Complete            | Processes and injects immediately          |
| Loading             | Queues for batch processing on window load |
| Multiple Components | Batches together for efficiency            |

```js
// Document loaded - processes immediately
const StyledComponent = styled(Component, () => 'color: red;');

// Document loading - queued for batch processing
const AnotherStyled = styled(Component, () => 'color: blue;');
```

## API Reference

### styled(BaseComponent, styles?, options?)

Creates a styled component class.

**Parameters:**

- `BaseComponent` (Function) - Component class to extend
- `styles` (Function|String) - Style function or CSS string
- `options` (Object) - Component configuration options

**Returns:** Extended component class with scoped styling

### configured(BaseComponent, options)

Creates a component with configuration but no styles:

```js
const ConfiguredComponent = configured(Component, {
	tag: 'article',
	role: 'main',
	textContent: 'Default Content',
});
```

### Utility Functions

#### appendStyles(css, id?)

Inject CSS directly into the page:

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

#### themeStyles({ styles, scope })

Generate themed CSS with optional scoping:

```js
const themedCSS = themeStyles({
	styles: ({ colors }) => `color: ${colors.white}; background: ${colors.black};`,
	scope: '.my-component',
});
// Returns: ".my-component { color: hsl(0, 0%, 90%); background: hsl(0, 0%, 10%); }"
```

#### shimCSS(styleConfig)

Complete style processing pipeline:

```js
shimCSS({
	styles: ({ colors }) => `
    display: flex;
    background: ${colors.blue};
    & .item { padding: 8px; }
  `,
	scope: '.my-scoped-component',
});
```

## Development Features

### Debug Class Names

Development mode adds inheritance-based class names for easier debugging:

```js
// Development classes: "a1b2c3 MyCustomComponent Component Elem"
class MyCustomComponent extends Component {}
const StyledCustom = styled(MyCustomComponent, () => 'color: blue;');
```

### Memory Management

Class-level styles injected by `styled()` persist for the page lifetime. They are scoped to a unique class and do not interfere with other components, but are not removed when instances disconnect.

Per-instance styles set via the `styles` option on a component instance are cleaned up when that component disconnects from the DOM.
