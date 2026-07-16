import { TinyColor, random, readability, isReadable, mostReadable } from '@ctrl/tinycolor';

let selectedOverride;

const colors = {
	random,
	readability,
	isReadable,
	mostReadable,

	// Shared instances for speed (cloning per access proved too slow) - frozen so an
	// accidental mutation (e.g. setAlpha) throws instead of silently recoloring the app.
	// Use colors.alpha(color, alpha) for transparency.
	orange: Object.freeze(new TinyColor('hsl(29, 55%, 45%)')),
	gray: Object.freeze(new TinyColor('hsl(0, 0%, 45%)')),
	yellow: Object.freeze(new TinyColor('hsl(44, 55%, 45%)')),
	green: Object.freeze(new TinyColor('hsl(74, 55%, 45%)')),
	teal: Object.freeze(new TinyColor('hsl(164, 55%, 45%)')),
	blue: Object.freeze(new TinyColor('hsl(209, 55%, 45%)')),
	purple: Object.freeze(new TinyColor('hsl(254, 55%, 45%)')),
	pink: Object.freeze(new TinyColor('hsl(314, 55%, 45%)')),
	red: Object.freeze(new TinyColor('hsl(359, 55%, 45%)')),
	transparent: Object.freeze(new TinyColor('rgba(255, 255, 255, 0)')),
	superWhite: Object.freeze(new TinyColor('hsl(0, 100%, 100%)')),
	vantablack: Object.freeze(new TinyColor('hsl(0, 0%, 0%)')),

	get white() {
		return colors.whiteish();
	},
	get black() {
		return colors.blackish();
	},

	get selected() {
		return selectedOverride ?? colors.yellow;
	},
	set selected(color) {
		selectedOverride = color;
	},

	whiteish: (color = colors.gray) => color.lighten(45),
	lightest: color => color.lighten(40),
	lighter: color => color.lighten(27),
	light: color => color.lighten(17),
	dark: color => color.darken(15),
	darker: color => color.darken(25),
	darkest: color => color.darken(30),
	blackish: (color = colors.gray) => color.darken(35),
	alpha: (color, alpha) => new TinyColor(color.toHslString()).setAlpha(alpha),
};

export default colors;
