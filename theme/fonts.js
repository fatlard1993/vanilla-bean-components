import colors from './colors';

const fontAwesome = `
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased;
	display: inline-block;
	font-style: normal;
	font-variant: normal;
	text-rendering: auto;
	line-height: 1;
	font-family: 'Font Awesome 6 Free';
	font-weight: 400;
`;

export default {
	code: `
		font-family: "FontWithASyntaxHighlighter", monospace;
		font-palette: --vbc-javascript-theme;
		padding: 3px;
		width: fit-content;
		color: ${colors.light(colors.red)}; /* default color */
		background-color: ${colors.black};
	`,
	fontAwesome,
	fontAwesomeBrands: `
		${fontAwesome}

		font-family: 'Font Awesome 6 Brands';
		font-weight: normal;
	`,
	fontAwesomeSolid: `
		${fontAwesome}

		font-weight: 600;
	`,
	sourceCodePro: `
		font-family: 'Source Code Pro', monospace;
		font-size: 1em;
		line-height: 1.5em;
		tab-size: 2;
	`,
};
