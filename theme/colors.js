import TinyColor, { random, readability, isReadable, mostReadable } from '@ctrl/tinycolor';

export const colors = {
	random,
	readability,
	isReadable,
	mostReadable,
	get orange() {
		return new TinyColor('hsl(29, 55%, 45%)');
	},
	get grey() {
		return new TinyColor('hsl(0, 0%, 45%)');
	},
	get yellow() {
		return new TinyColor('hsl(44, 55%, 45%)');
	},
	get green() {
		return new TinyColor('hsl(74, 55%, 45%)');
	},
	get teal() {
		return new TinyColor('hsl(164, 55%, 45%)');
	},
	get blue() {
		return new TinyColor('hsl(209, 55%, 45%)');
	},
	get purple() {
		return new TinyColor('hsl(254, 55%, 45%)');
	},
	get pink() {
		return new TinyColor('hsl(314, 55%, 45%)');
	},
	get red() {
		return new TinyColor('hsl(359, 55%, 45%)');
	},
	get transparent() {
		return new TinyColor('rgba(255, 255, 255, 0)');
	},
	get white() {
		return colors.whiteish();
	},
	get black() {
		return colors.blackish();
	},
	whiteish: (color = colors.grey) => color.lighten(45),
	lightest: color => color.lighten(40),
	lighter: color => color.lighten(30),
	light: color => color.lighten(20),
	dark: color => color.darken(15),
	darker: color => color.darken(25),
	darkest: color => color.darken(30),
	blackish: (color = colors.grey) => color.darken(35),
};

export default colors;
