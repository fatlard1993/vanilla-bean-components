import colors from './colors';
import { space } from './tokens';

const fontAwesome = `
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased;
	display: inline-block;
	font-style: normal;
	font-variant: normal;
	text-rendering: auto;
	line-height: 1;
	font-family: 'Font Awesome 7 Free';
	font-weight: 400;
`;

/*
 * Font families named for their job, as the color roles are. Each is a CSS font-family list an app can assign before
 * the page loads (`theme.fonts.family.display = "'Press Start 2P', monospace"`); assigning undefined hands it back.
 * body is the page's text; code, code alone, without the code look `fonts.code` carries; display, headings and other
 * type set apart, which follows body until it's given its own.
 */
const defaults = {
	body: "'Kode Mono Variable', monospace",
	// Plain monospace: the syntax-highlighting font colours text by itself, so it's fonts.code's alone, in front of this
	code: "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
};
const assigned = {};

const family = {
	get body() {
		return assigned.body ?? defaults.body;
	},
	set body(value) {
		assigned.body = value;
	},
	get code() {
		return assigned.code ?? defaults.code;
	},
	set code(value) {
		assigned.code = value;
	},
	get display() {
		return assigned.display ?? family.body;
	},
	set display(value) {
		assigned.display = value;
	},
	// Whether display has a family of its own, so headings only take one when it differs from the text around them
	get hasDisplay() {
		return assigned.display !== undefined;
	},
};

// CSS an app set in place of the code look or the page text before the roles existed: assigning still works
const replaced = {};

export default {
	family,
	get code() {
		if (replaced.code !== undefined) return replaced.code;

		return `
		font-family: "FontWithASyntaxHighlighter", ${family.code};
		font-palette: --vbc-javascript-theme;
		padding: ${space.xs};
		width: fit-content;
		color: ${colors.light(colors.red)}; /* default color */
		background-color: ${colors.black};
	`;
	},
	set code(css) {
		replaced.code = css;
	},
	fontAwesome,
	fontAwesomeBrands: `
		${fontAwesome}

		font-family: 'Font Awesome 7 Brands';
		font-weight: normal;
	`,
	fontAwesomeSolid: `
		${fontAwesome}

		font-weight: 900;
	`,
	// The page's text, in the body family
	get kodeMono() {
		if (replaced.kodeMono !== undefined) return replaced.kodeMono;

		return `
		font-family: ${family.body};
		line-height: normal;
	`;
	},
	set kodeMono(css) {
		replaced.kodeMono = css;
	},
};
