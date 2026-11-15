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
	code: '"FontWithASyntaxHighlighter", monospace',
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

export default {
	family,
	get code() {
		return `
		font-family: ${family.code};
		font-palette: --vbc-javascript-theme;
		padding: ${space.xs};
		width: fit-content;
		color: ${colors.light(colors.red)}; /* default color */
		background-color: ${colors.black};
	`;
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
		return `
		font-family: ${family.body};
		line-height: normal;
	`;
	},
};
