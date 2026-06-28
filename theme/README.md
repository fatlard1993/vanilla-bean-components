# theme

Design tokens: colors, fonts, and component base styles, passed to every `styled()` call and available for direct use.

## The Default Aesthetic

VBC ships with an intentional design language: dark backgrounds, a teal accent palette, and a technical/monospace typographic voice. This is a position, not a placeholder. The components look the way they look because that's how they were designed.

That said, the theme system is layered. You can work at any layer depending on how much you want to change.

## Customizing the Theme

### Layer 1: Per-instance styles

For one-off overrides on a specific component instance, pass `styles` as an option:

```js
// Object form — applied as inline styles
new Button({ styles: { backgroundColor: '#your-brand', borderRadius: '4px' } });

// Function form — receives theme, generates scoped CSS
new Dialog({
	styles: ({ colors }) => `
        border-color: ${colors.purple};
        & .header { color: ${colors.purple}; }
    `,
});
```

### Layer 2: Per-class overrides with `styled()`

To apply a consistent override across all instances of a component type, create a styled subclass. The style function receives the VBC theme. Ignore it and use your own tokens if you prefer:

```js
import { styled, Button } from '@vanilla-bean/components';

const MY_BRAND = '#3d7aed';

const BrandButton = styled(
	Button,
	() => `
    background: ${MY_BRAND};
    border: none;
    border-radius: 4px;
    color: white;

    &:hover { background: #2f62c4; }
`,
);

// BrandButton inherits all Button behavior; only the appearance changes
new BrandButton({ textContent: 'Save', onPointerPress: handleSave });
```

This pattern applies to any component, including the named shorthand:

```js
const BrandDialog = styled.Dialog`
	border-color: ${() => MY_BRAND};
	background: #1a1a2e;
`;
```

### Layer 3: Override theme tokens globally

The theme singleton is imported once and shared across all `styled()` calls. Mutate it before your components initialize and every component that uses that token picks up the change:

```js
import { theme } from '@vanilla-bean/components';
import { TinyColor } from '@ctrl/tinycolor';

// Replace the accent color — affects every component that uses colors.teal
theme.colors.teal = new TinyColor('#3d7aed');

// Then import and use components as normal — they'll use your teal
import { Button, Dialog } from '@vanilla-bean/components';
```

Mutate as many tokens as your design system requires. Because colors are plain properties on the object, this is straightforward JavaScript.

### Layer 4: Skip the theme system entirely

`styled()` is optional. Every component works without it. If you want to use your own CSS pipeline (CSS modules, Tailwind, a design token library), just don't call `styled()`. Write plain CSS that targets the component's tag or a class you add:

```js
// Add your own class; target it in your stylesheet
new Button({ addClass: 'my-button', textContent: 'Save' });
```

```css
/* your-styles.css */
.my-button {
	background: var(--brand-primary);
	border-radius: var(--radius-md);
}
```

Or inject scoped styles directly via `appendStyles`:

```js
import { appendStyles } from '@vanilla-bean/components/styled';

appendStyles(
	`
    .my-button { background: #3d7aed; border-radius: 4px; }
`,
	'my-button-styles',
);
```

The four layers compose freely. Per-instance `styles` always take precedence over class-level `styled()` CSS. Both are scoped and don't leak.

## Quick Start

### Basic Color Usage

Access colors directly or use within styled components:

```js
import { theme } from '@vanilla-bean/components';

// Direct color access
const primaryColor = theme.colors.blue;
console.log(primaryColor.toHexString()); // "#4a7ba7"

// With styled components
const StyledButton = styled.Button`
	background: ${({ colors }) => colors.blue};
	color: ${({ colors }) => colors.mostReadable(colors.blue, [colors.white, colors.black])};

	&:hover {
		background: ${({ colors }) => colors.darker(colors.blue)};
	}
`;
```

### Font Integration

Apply typography and iconography:

```js
// Typography in styled components
const CodeBlock = styled.Pre`
	${({ fonts }) => fonts.code}
	${({ fonts }) => fonts.kodeMono}

  &.language-javascript {
		font-palette: --vbc-javascript-theme;
	}
`;

// Icons with Font Awesome
const IconButton = styled.Button`
	&:before {
		${({ fonts }) => fonts.fontAwesomeSolid}
		content: "\\f015"; /* Home icon */
		margin-right: 8px;
	}
`;
```

### Component Base Styles

Extend pre-built component styles:

```js
// Apply base button styles with customization
const CustomButton = styled.Button`
	${({ button }) => button}
	background: ${({ colors }) => colors.purple};
	border-radius: 8px;
`;

// Mix multiple base styles
const FormCard = styled.Component`
	background: ${({ colors }) => colors.darker(colors.gray)};
	border: 1px solid ${({ colors }) => colors.darkest(colors.gray)};
	padding: 24px;
	border-radius: 6px;

	input,
	select,
	textarea {
		${({ input }) => input}
	}
`;
```

### Theme Integration

Use theme in Component options:

```js
new Component({
	styles: ({ colors, fonts }) => ({
		color: colors.mostReadable(colors.blue, [colors.white, colors.black]),
		...fonts.kodeMono,
		background: colors.lighter(colors.gray),
		padding: '16px',
		borderRadius: '4px',
	}),
});
```

## Color System

### Base Colors

9 carefully chosen base colors for comprehensive UI design:

```js
const { colors } = theme;

// Primary palette
colors.blue; // #4a7ba7 - Primary actions, links
colors.green; // #5cb85c - Success states, positive actions
colors.red; // #d9534f - Errors, warnings, destructive actions
colors.orange; // #f0ad4e - Alerts, secondary warnings
colors.purple; // #5d4e75 - Special features, premium content

// Extended palette
colors.teal; // #5bc0de - Information, neutral actions
colors.yellow; // #f0e68c - Cautions, highlights
colors.pink; // #d63384 - Creative, playful elements
colors.gray; // #6c757d - Text, borders, backgrounds
```

### Lightness Variations

8 systematic lightness modifiers for consistent color relationships:

```js
// Light variations (for backgrounds, subtle elements)
colors.whiteish(color); // 45% lighter - Near white variants
colors.lightest(color); // 40% lighter - Very light backgrounds
colors.lighter(color); // 27% lighter - Light backgrounds
colors.light(color); // 17% lighter - Subtle highlights

// Dark variations (for text, emphasis)
colors.dark(color); // 15% darker - Subtle emphasis
colors.darker(color); // 25% darker - Strong emphasis
colors.darkest(color); // 30% darker - Maximum contrast
colors.blackish(color); // 35% darker - Near black variants
```

**Usage examples:**

```js
// Create color hierarchies
const buttonStyles = ({ colors }) => `
  background: ${colors.blue};
  border: 1px solid ${colors.darker(colors.blue)};
  color: ${colors.lightest(colors.blue)};

  &:hover {
    background: ${colors.light(colors.blue)};
  }

  &:active {
    background: ${colors.dark(colors.blue)};
  }
`;

// Semantic color mapping
const statusColors = {
	success: colors.green,
	successBg: colors.lightest(colors.green),
	warning: colors.orange,
	warningBg: colors.lightest(colors.orange),
	error: colors.red,
	errorBg: colors.lightest(colors.red),
};
```

### Utility Colors & Accessibility

Special utility colors and WCAG compliance helpers:

```js
// Utility colors
colors.transparent; // Transparent - for overlays, hidden elements
colors.white; // Pure white - text on dark backgrounds
colors.black; // Pure black - text on light backgrounds
colors.superWhite; // #fefefe - slightly warmer white
colors.vantablack; // #0a0a0a - rich black alternative

// Accessibility functions
colors.mostReadable(baseColor, [colors.white, colors.black]);
// Returns the highest contrast color for optimal readability

colors.readability(color1, color2);
// Returns WCAG contrast ratio (1-21, higher is better)

colors.isReadable(color1, color2, { level: 'AA', size: 'normal' });
// Tests WCAG compliance (AA/AAA levels, normal/large text)

colors.random();
// Generates random color for placeholders, testing
```

**Accessibility examples:**

```js
// Ensure accessible text contrast
const accessibleCard = ({ colors }) => {
	const bg = colors.darker(colors.gray);
	const textColor = colors.mostReadable(bg, [colors.white, colors.black]);

	return `
    background: ${bg};
    color: ${textColor};
  `;
};

// Validate color combinations
const validateDesign = (bg, text) => {
	const ratio = colors.readability(bg, text);
	const isAccessible = colors.isReadable(bg, text, { level: 'AA' });

	console.log(`Contrast ratio: ${ratio.toFixed(2)}`);
	console.log(`WCAG AA compliant: ${isAccessible}`);
};

validateDesign(colors.blue, colors.white); // Good contrast
validateDesign(colors.light(colors.blue), colors.white); // May fail
```

## Typography & Fonts

### Primary Typography

Complete typography system with specialized fonts:

```js
// Interface typography
fonts.kodeMono; // Kode Mono Variable - Primary interface font
// Includes: font-family, font-weight variations, font-feature-settings

// Code and syntax highlighting
fonts.code; // FontWithASyntaxHighlighter + syntax highlighting setup
// Includes: monospace font, syntax color palettes, ligatures
```

**Font usage:**

```js
// Interface elements
const UIComponent = styled.Component`
	${({ fonts }) => fonts.kodeMono}
	font-weight: 400;
	font-size: 14px;
`;

// Code blocks with syntax highlighting
const CodeEditor = styled.Pre`
	${({ fonts }) => fonts.code}

	&.language-javascript {
		font-palette: --vbc-javascript-theme;
	}

	&.language-css {
		font-palette: --vbc-css-theme;
	}

	&.language-html {
		font-palette: --vbc-html-theme;
	}
`;
```

### Icon System

Complete Font Awesome 6 integration:

```js
// Base icon setup
fonts.fontAwesome; // Base Font Awesome styles and setup

// Icon weight variations
fonts.fontAwesomeSolid; // Solid icons (font-weight: 600)
fonts.fontAwesomeBrands; // Brand icons (font-weight: normal)
```

**Icon examples:**

```js
// Basic icons
const HomeButton = styled.Button`
	&:before {
		${({ fonts }) => fonts.fontAwesomeSolid}
		content: "\\f015"; /* Home icon */
		margin-right: 8px;
	}
`;

// Brand icons
const SocialLink = styled.Link`
	&:before {
		${({ fonts }) => fonts.fontAwesomeBrands}
		content: "\\f09b"; /* GitHub icon */
	}
`;

// Complex icon layouts
const IconGrid = styled.Component`
	.icon {
		${({ fonts }) => fonts.fontAwesome}

		&.solid {
			${({ fonts }) => fonts.fontAwesomeSolid}
		}

		&.brand {
			${({ fonts }) => fonts.fontAwesomeBrands}
		}
	}
`;
```

### Syntax Highlighting Themes

Built-in color palettes for code syntax highlighting:

```css
/* Available CSS custom properties */
--vbc-javascript-theme  /* JavaScript syntax colors */
--vbc-html-theme       /* HTML/markup syntax colors */
--vbc-css-theme        /* CSS syntax colors */
```

## Component Styles

### Pre-Built Component Styles

Complete styling for standard UI elements:

```js
theme.button; // Button styling with states (hover, active, disabled)
theme.input; // Form input styling with validation states
theme.table; // Data table with hover effects and borders
theme.scrollbar; // Custom scrollbar styling to match theme
theme.code; // Code syntax highlighting configuration
theme.page; // Global page styles and typography reset
```

**Component style usage:**

```js
// Extend base button styles
const PrimaryButton = styled.Button`
	${({ button }) => button}
	background: ${({ colors }) => colors.blue};

	&:hover {
		background: ${({ colors }) => colors.darker(colors.blue)};
	}
`;

// Apply input styling with custom validation
const ValidatedInput = styled.Input`
	${({ input }) => input}

	&.error {
		border-color: ${({ colors }) => colors.red};
		background: ${({ colors }) => colors.lightest(colors.red)};
	}

	&.success {
		border-color: ${({ colors }) => colors.green};
	}
`;

// Styled data table
const DataTable = styled.Table`
	${({ table }) => table}

	th {
		background: ${({ colors }) => colors.darker(colors.gray)};
		color: ${({ colors }) => colors.white};
	}
`;
```

### Global Page Styling

The `page` style provides comprehensive global styling:

**Typography hierarchy:**

- `h1`-`h6` headings with semantic markdown-style prefixes
- Consistent font sizing and spacing
- Responsive typography scaling

**Form elements:**

- `input`, `select`, `textarea` styling
- `button` base styles with hover states
- Form validation states

**Content elements:**

- `blockquote` styling with left border
- `code` inline and block styling
- `table` responsive design
- `a` link styling with hover effects

**Custom scrollbars:**

- Styled to match theme colors
- Consistent across all scrollable elements

```js
// Apply global page styles
const App = styled.Component`
	${({ page }) => page}

	// Override specific globals
  h1 {
		color: ${({ colors }) => colors.purple};
	}

	.custom-button {
		${({ button }) => button}
		background: transparent;
		border: 2px solid ${({ colors }) => colors.blue};
	}
`;
```

## API Reference

### Theme Object Structure

```typescript
interface Theme {
	colors: ColorSystem;
	fonts: FontSystem;

	// Component base styles (CSS strings)
	button: string;
	input: string;
	table: string;
	scrollbar: string;
	code: string;
	page: string;
}
```

### ColorSystem Interface

```typescript
interface ColorSystem {
	// Base colors (TinyColor instances)
	orange: TinyColor;
	gray: TinyColor;
	yellow: TinyColor;
	green: TinyColor;
	teal: TinyColor;
	blue: TinyColor;
	purple: TinyColor;
	pink: TinyColor;
	red: TinyColor;

	// Utility colors
	transparent: TinyColor;
	white: TinyColor;
	black: TinyColor;
	superWhite: TinyColor;
	vantablack: TinyColor;

	// Lightness modifiers
	whiteish(color: TinyColor): TinyColor;
	lightest(color: TinyColor): TinyColor;
	lighter(color: TinyColor): TinyColor;
	light(color: TinyColor): TinyColor;
	dark(color: TinyColor): TinyColor;
	darker(color: TinyColor): TinyColor;
	darkest(color: TinyColor): TinyColor;
	blackish(color: TinyColor): TinyColor;

	// Accessibility functions
	mostReadable(baseColor: TinyColor, candidates: TinyColor[]): TinyColor;
	readability(color1: TinyColor, color2: TinyColor): number;
	isReadable(
		color1: TinyColor,
		color2: TinyColor,
		options?: {
			level?: 'AA' | 'AAA';
			size?: 'normal' | 'large';
		},
	): boolean;
	random(): TinyColor;
}
```

### FontSystem Interface

```typescript
interface FontSystem {
	kodeMono: string; // Primary interface font CSS
	code: string; // Code font with syntax highlighting setup
	fontAwesome: string; // Base Font Awesome styles
	fontAwesomeSolid: string; // Solid Font Awesome icons
	fontAwesomeBrands: string; // Brand Font Awesome icons
}
```
