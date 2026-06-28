import { TinyColor, random, readability, isReadable, mostReadable } from '@ctrl/tinycolor';

const colors = {
	random,
	readability,
	isReadable,
	mostReadable,

	// Base colors — plain writable properties so theme.colors.X = new TinyColor(...) works
	orange: new TinyColor('hsl(29, 55%, 45%)'),
	gray: new TinyColor('hsl(0, 0%, 45%)'),
	yellow: new TinyColor('hsl(44, 55%, 45%)'),
	green: new TinyColor('hsl(74, 55%, 45%)'),
	teal: new TinyColor('hsl(164, 55%, 45%)'),
	blue: new TinyColor('hsl(209, 55%, 45%)'),
	purple: new TinyColor('hsl(254, 55%, 45%)'),
	pink: new TinyColor('hsl(314, 55%, 45%)'),
	red: new TinyColor('hsl(359, 55%, 45%)'),
	transparent: new TinyColor('rgba(255, 255, 255, 0)'),
	superWhite: new TinyColor('hsl(0, 100%, 100%)'),
	vantablack: new TinyColor('hsl(0, 0%, 0%)'),

	// Derived — getters so they recompute when gray is reassigned
	get white() {
		return colors.whiteish();
	},
	get black() {
		return colors.blackish();
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
