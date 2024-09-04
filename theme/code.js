import colors from './colors';
import fonts from './fonts';

export default `
	@font-face {
		font-family: 'FontWithASyntaxHighlighter';
		src:
			url('vanilla-bean-components/FontWithASyntaxHighlighter-Regular.woff2')
			format('woff2')
		;
	}

	@font-palette-values --vbc-code-theme {
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

	pre[class*="language-"] {
		background-color: ${colors.black};
		display: inline-block;
		padding: 12px;
	}

	code, textarea.syntaxHighlighting, input.syntaxHighlighting {
		${fonts.code}
	}
`;
