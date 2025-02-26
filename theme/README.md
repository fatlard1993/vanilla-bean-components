# Theme

The theme contains 3 major things:

- Colors
- Fonts
- Standard HTML styles

## Usage

Component.styles()

```js
new Component({
	styles: theme => ({ color: theme.colors.red }),
});
```

styled

```js
const RedOne = styled(
	Component,
	theme => `
		color: ${theme.colors.red};
	`,
);
```

import

```js
import { theme } from 'vanilla-bean-components';

console.log(theme.colors.red);
```

## Colors

The [colors](./theme/colors.js) in this theme use [TinyColor](https://github.com/scttcper/tinycolor) (and therefore all of its various features). A restricted set of colors and lightness variations have been specifically chosen to accentuate each other (based on color distance) and to promote simple, high visibility UI.

9 colors are offered:

- orange
- gray
- yellow
- green
- teal
- blue
- purple
- pink
- red

Which each support 8 lightness modifiers:

- whiteish
- lightest
- lighter
- light
- dark
- darker
- darkest
- blackish

Along with 5 utility colors:

- transparent
- white
- black
- superWhite
- vantablack

```js
colors.red;
colors.lighter(colors.green);
colors.pink.lighten(33);
colors.random();
colors.mostReadable(userSelectedColor, [colors.white, colors.black]);
```

## Fonts

The fonts define inline-able portions of css to configure any selector with a particular font.

```js
const IconOne = styled(
	Component,
	theme => `
		&:before {
			${fonts.fontAwesomeSolid}

			content: "\f015";
			font-size: 14px;
			color: ${colors.red};
		}
	`,
);
```

The fonts used here are:

- [Kode Mono](https://kodemono.com/)
- [Font Awesome](https://fontawesome.com/)
- [Font With a Syntax Highlighter](https://blog.glyphdrawing.club/font-with-built-in-syntax-highlighting/)

## Standard HTML styles

Styles for all basic page elements is also the responsibility of the theme. Maintaining page styles like this offers two main benefits:

1. All standard HTML will automatically align to the desired style regardless where it came from
2. Any standard component style CSS can be directly accessed, mutated if necessary, and re-applied to another custom component
