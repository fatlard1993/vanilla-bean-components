# Theme

Colors, fonts, and component styles with automatic CSS processing and theme integration.

## Usage

```js
import { theme } from 'vanilla-bean-components';

// In styled components
const StyledButton = styled.Button`
	background: ${({ colors }) => colors.blue};
	${({ button }) => button}/* Apply base button styles */
`;

// In component options
new Component({
	styles: ({ colors, fonts }) => ({
		color: colors.mostReadable(colors.blue, [colors.white, colors.black]),
		...fonts.kodeMono,
	}),
});

// Direct access
console.log(theme.colors.blue.toHexString()); // "#4a7ba7"
```

## Colors

Built on [TinyColor](https://github.com/scttcper/tinycolor) with 9 base colors, 8 lightness variations, and accessibility helpers.

### Base Colors

```js
colors.orange  colors.gray   colors.yellow  colors.green  colors.teal
colors.blue    colors.purple colors.pink    colors.red
```

### Lightness Modifiers

```js
colors.whiteish(color); // 45% lighter
colors.lightest(color); // 40% lighter
colors.lighter(color); // 27% lighter
colors.light(color); // 17% lighter
colors.dark(color); // 15% darker
colors.darker(color); // 25% darker
colors.darkest(color); // 30% darker
colors.blackish(color); // 35% darker
```

### Utility Colors & Functions

```js
colors.transparent  colors.white  colors.black  colors.superWhite  colors.vantablack

// Accessibility
colors.mostReadable(baseColor, [colors.white, colors.black]);
colors.readability(color1, color2); // WCAG contrast ratio
colors.isReadable(color1, color2, { level: "AA", size: "normal" });
colors.random();
```

### Common Patterns

```js
// Semantic mapping
const semantic = {
	primary: colors.blue,
	success: colors.green,
	warning: colors.yellow,
	danger: colors.red,
};

// Dynamic theming
const userColor = colors.red.lighten(20).saturate(10);
const textColor = colors.mostReadable(userColor, [colors.white, colors.black]);
```

## Fonts

Complete CSS for typography and iconography with syntax highlighting.

```js
fonts.kodeMono; // Primary interface font
fonts.code; // Code blocks with syntax highlighting
fonts.fontAwesome; // Base Font Awesome styles
fonts.fontAwesomeSolid; // Solid icons (weight: 600)
fonts.fontAwesomeBrands; // Brand icons (weight: normal)
```

### Usage

```js
// Icons
const IconButton = styled.Button`
	&:before {
		${({ fonts }) => fonts.fontAwesomeSolid}
		content: "\f015"; /* Home icon */
	}
`;

// Code blocks
const CodeBlock = styled.Pre`
	${({ fonts }) => fonts.code}
	&.language-javascript {
		font-palette: --vbc-javascript-theme;
	}
	&.language-html {
		font-palette: --vbc-html-theme;
	}
	&.language-css {
		font-palette: --vbc-css-theme;
	}
`;
```

## Component Styles

Pre-built styles for standard HTML elements.

```js
theme.button; // Complete button styling with hover/active states
theme.input; // Form input styling with validation states
theme.table; // Data table with hover effects
theme.scrollbar; // Custom scrollbar theming
theme.code; // Code syntax highlighting setup
theme.page; // Global page and typography styles
```

### Usage

```js
// Extend base styles
const CustomButton = styled.Button`
	${({ button }) => button}
	background: ${({ colors }) => colors.purple};
`;

// Mix styles
const cardStyles = ({ colors }) => `
  background: ${colors.darker(colors.gray)};
  border: 1px solid ${colors.darkest(colors.gray)};
  border-radius: 6px;
  padding: 16px;
`;
```

## Global Styling

The `page` style automatically styles standard HTML elements:

- **Typography** - `h1`-`h6` with semantic prefixes (`#`, `##`, etc.)
- **Forms** - `input`, `select`, `textarea`, `button`
- **Content** - `blockquote`, `code`, `table`, `a`
- **Scrollbars** - Custom styled to match theme

```js
// Override globals
appendStyles(
	`
  h1 { color: ${theme.colors.purple}; }
  .btn-outline {
    ${theme.button}
    background: transparent;
    border: 2px solid ${theme.colors.blue};
  }
`,
	'global-overrides',
);
```

## Advanced Usage

### Theme Variations

```js
const createTheme = primaryColor => ({
	...theme,
	colors: {
		...theme.colors,
		primary: primaryColor,
		primaryLight: theme.colors.lighter(primaryColor),
	},
});
```

### Performance

```js
// Cache expensive calculations
const colorCache = new Map();
const getCachedColor = (colorKey, modifier) => {
	const key = `${colorKey}-${modifier}`;
	if (!colorCache.has(key)) {
		colorCache.set(key, theme.colors[modifier](theme.colors[colorKey]));
	}
	return colorCache.get(key);
};
```

### CSS Custom Properties

```js
// Export as CSS variables
const cssProps = Object.entries(theme.colors)
	.filter(([, color]) => typeof color !== 'function')
	.map(([name, color]) => `--color-${name}: ${color};`)
	.join('\n');

appendStyles(`:root { ${cssProps} }`);
```

## API Reference

```typescript
interface Theme {
  colors: {
    // Base colors
    orange | gray | yellow | green | teal | blue | purple | pink | red: TinyColor;

    // Utils
    transparent | white | black | superWhite | vantablack: TinyColor;

    // Modifiers
    whiteish | lightest | lighter | light | dark | darker | darkest | blackish: (color: TinyColor) => TinyColor;

    // Accessibility
    mostReadable: (color: TinyColor, candidates: TinyColor[]) => TinyColor;
    readability: (color1: TinyColor, color2: TinyColor) => number;
    isReadable: (color1: TinyColor, color2: TinyColor, options?: object) => boolean;
    random: () => TinyColor;
  };

  fonts: {
    kodeMono | code | fontAwesome | fontAwesomeSolid | fontAwesomeBrands: string;
  };

  // Component styles
  button | input | table | code | page | scrollbar: string;
}
```

## Font Assets

Requires these font files to be available:

- **FontWithASyntaxHighlighter-Regular.woff2** - Syntax highlighting
- **Kode Mono Variable** - Interface font
- **Font Awesome 6 Free** - Icons
