import { radius, space } from './tokens';

// The syntax font and its palettes: at-rules, so they stay at the top level of whatever includes them
export const codeFonts = ({ colors }) => `
	@font-face {
		font-family: 'FontWithASyntaxHighlighter';
		src:
			url('@vanilla-bean/components/FontWithASyntaxHighlighter-Regular.woff2')
			format('woff2')
		;
	}

	@font-palette-values --vbc-javascript-theme {
		font-family: 'FontWithASyntaxHighlighter';
		override-colors:
			0 ${colors.lighter(colors.purple)}, /* keywords, {} */
			1 ${colors.light(colors.gray)}, /* comments */
			2 ${colors.light(colors.orange)}, /* literals */
			3 ${colors.light(colors.orange)}, /* numbers */
			4 ${colors.lighter(colors.blue)}, /* functions, [] */
			5 ${colors.white}, /* js others */
			6 ${colors.black}, /* not in use */
			7 ${colors.light(colors.green)}, /* inside quotes, css properties, few chars */
			8 ${colors.light(colors.green)} /* few chars */
		;
	}

	@font-palette-values --vbc-json-theme {
		font-family: 'FontWithASyntaxHighlighter';
		override-colors:
			0 ${colors.lighter(colors.purple)}, /* keywords, {} */
			1 ${colors.light(colors.red)}, /* comments */
			2 ${colors.light(colors.green)}, /* literals */
			3 ${colors.light(colors.orange)}, /* numbers */
			4 ${colors.lighter(colors.blue)}, /* functions, [] */
			5 ${colors.white}, /* others */
			6 ${colors.black}, /* not in use */
			7 ${colors.light(colors.green)}, /* inside quotes, css properties, few chars */
			8 ${colors.green} /* few chars */
		;
	}

	@font-palette-values --vbc-html-theme {
		font-family: 'FontWithASyntaxHighlighter';
		override-colors:
			0 ${colors.lighter(colors.red)}, /* keywords */
			1 ${colors.light(colors.gray)}, /* comments */
			2 ${colors.light(colors.red)}, /* literals */
			3 ${colors.light(colors.orange)}, /* numbers */
			4 ${colors.lighter(colors.blue)}, /* functions, [] */
			5 ${colors.pink}, /* others */
			6 ${colors.black}, /* not in use */
			7 ${colors.light(colors.green)}, /* inside quotes, few chars */
			8 ${colors.light(colors.red)} /* quotes, tags */
		;
	}

	@font-palette-values --vbc-css-theme {
		font-family: 'FontWithASyntaxHighlighter';
		override-colors:
			0 ${colors.lighter(colors.purple)}, /* keywords, {} */
			1 ${colors.light(colors.gray)}, /* comments */
			2 ${colors.light(colors.orange)}, /* literals */
			3 ${colors.light(colors.green)}, /* numbers */
			4 ${colors.lighter(colors.blue)}, /* functions, [] */
			5 ${colors.white}, /* others */
			6 ${colors.black}, /* not in use */
			7 ${colors.light(colors.green)}, /* inside quotes, css properties, few chars */
			8 ${colors.light(colors.green)} /* few chars */
		;
	}
`;

const codeLook = ({ colors, fonts }, selector) => `
	${selector} {
		${fonts.code}

		&[class*="language-html"] {
			font-palette: --vbc-html-theme;
			color: ${colors.white};
		}

		&[class*="language-css"] {
			font-palette: --vbc-css-theme;
			color: ${colors.light(colors.green)};
		}

		&[class*="language-json"] {
			font-palette: --vbc-json-theme;
			color: ${colors.white};
		}
	}

`;

// Code that asks for highlighting by class or attribute, and the Code component's block
export const highlightedCode = ({ colors, fonts }) => `
	pre[class*="language-"] {
		position: relative;
		background-color: ${colors.black};
		display: inline-block;
		padding: ${space.md};
		border-radius: ${radius.sm};
		text-decoration: inherit;
		max-width: 100%;

		&:has(> button) {
			padding-right: 34px;
		}

		button {
			position: absolute !important;
			top: 4px;
			right: 4px;
			width: 26px !important;
			height: 26px !important;
			font-size: 13px;
			opacity: 0.5;

			&:hover, &:focus {
				opacity: 0.8;
				top: 3px;
			}
		}

		code {
			display: block;
			overflow: auto;
			width: 100%;
		}
	}

	${codeLook({ colors, fonts }, 'textarea.syntax-highlighting, input.syntax-highlighting, pre[lang], code[class*="language-"]')}
`;

// Every bare code element
export const bareCode = theme => codeLook(theme, 'code');

export default theme => `${codeFonts(theme)}${highlightedCode(theme)}${bareCode(theme)}`;
