import { TinyColor, mostReadable } from '@ctrl/tinycolor';

const colors = {
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
	superWhite: Object.freeze(new TinyColor('hsl(0, 100%, 100%)')),
	vantablack: Object.freeze(new TinyColor('hsl(0, 0%, 0%)')),

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
	alpha: (color, alpha) => new TinyColor(typeof color === 'string' ? color : color.toHslString()).setAlpha(alpha),
};

/*
 * Colors named for their job rather than their hue. Each follows the hues it's drawn from until an app assigns it a
 * color of its own (`theme.colors.danger = new TinyColor('#e5484d')`); assigning undefined hands it back to its hues.
 * Assign before the components' styles are first drawn (before the page's load) for them to take it up.
 */
const roles = {
	// Anything that floats over the page: a dialog, a popover or menu, a sheet, a toast, a top bar
	surface: () => colors.darker(colors.gray),
	// The lift of a card, or a group of fields, off whatever it sits on
	raised: () => colors.alpha(colors.white, 0.05),
	// The library's own accent: the edge of whatever floats over the page
	accent: () => colors.teal,
	// The edge itself: a dialog's, a popover's, a menu's, a sheet's
	edge: () => colors.alpha(colors.light(colors.accent), 0.6),
	// The dimming behind a dialog
	overlay: () => colors.alpha(colors.vantablack, 0.6),
	warning: () => colors.yellow,
	success: () => colors.green,
	danger: () => colors.red,
	info: () => colors.blue,
	// Secondary text: meta lines, counts, hints, labels over a section
	muted: () => colors.light(colors.gray),
	// A hairline between things on the page's dark ground
	border: () => colors.alpha(colors.white, 0.12),
	// Focused, selected, checked and pressed: a focus ring, a chosen tab, a checked box, a latched button
	selected: () => colors.yellow,
};

const overrides = {};

for (const [name, derive] of Object.entries(roles)) {
	Object.defineProperty(colors, name, {
		enumerable: true,
		get: () => overrides[name] ?? derive(),
		set: color => {
			overrides[name] = color;
		},
	});
}

export default colors;
