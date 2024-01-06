import colors from './colors';

export default `
	code[class*="language-"],
	pre[class*="language-"] {
		text-align: left;
		white-space: pre;
		word-spacing: normal;
		word-break: normal;
		word-wrap: normal;
		hyphens: none;
		color: ${colors.light(colors.red)};
		background: ${colors.black};
		border-radius: 0.2em;
	}

	code[class*="language-"]::-moz-selection,
	pre[class*="language-"]::-moz-selection,
	code[class*="language-"] ::-moz-selection,
	pre[class*="language-"] ::-moz-selection {
		background: ${colors.darkest(colors.gray)};
	}

	code[class*="language-"]::selection,
	pre[class*="language-"]::selection,
	code[class*="language-"] ::selection,
	pre[class*="language-"] ::selection {
		background: ${colors.darkest(colors.gray)};
	}

	:not(pre) > code[class*="language-"] {
		white-space: normal;
		border-radius: 0.2em;
		padding: 0.1em;
	}

	pre[class*="language-"] {
		overflow: auto;
		position: relative;
		margin: 0.5em 0;
		padding: 1.25em 1em;
	}

	.language-css > code,
	.language-sass > code,
	.language-scss > code {
		color: ${colors.light(colors.orange)};
	}

	[class*="language-"] .namespace {
		opacity: 0.7;
	}

	.token.atrule {
		color: ${colors.lighter(colors.purple)};
	}

	.token.attr-name {
		color: ${colors.light(colors.yellow)};
	}

	.token.attr-value {
		color: ${colors.light(colors.green)};
	}

	.token.attribute {
		color: ${colors.light(colors.green)};
	}

	.token.boolean {
		color: ${colors.light(colors.orange)};
	}

	.token.builtin {
		color: ${colors.light(colors.yellow)};
	}

	.token.cdata {
		color: ${colors.lighter(colors.teal)};
	}

	.token.char {
		color: ${colors.lighter(colors.teal)};
	}

	.token.class {
		color: ${colors.light(colors.yellow)};
	}

	.token.class-name {
		color: ${colors.light(colors.yellow)};
	}

	.token.comment {
		color: ${colors.light(colors.gray)};
	}

	.token.constant {
		color: ${colors.lighter(colors.purple)};
	}

	.token.deleted {
		color: ${colors.light(colors.red)};
	}

	.token.doctype {
		color: ${colors.light(colors.gray)};
	}

	.token.entity {
		color: ${colors.light(colors.red)};
	}

	.token.function {
		color: ${colors.lighter(colors.blue)};
	}

	.token.hexcode {
		color: ${colors.light(colors.red)};
	}

	.token.id {
		color: ${colors.lighter(colors.purple)};
		font-weight: bold;
	}

	.token.important {
		color: ${colors.lighter(colors.purple)};
		font-weight: bold;
	}

	.token.inserted {
		color: ${colors.lighter(colors.teal)};
	}

	.token.keyword {
		color: ${colors.lighter(colors.purple)};
	}

	.token.number {
		color: ${colors.light(colors.orange)};
	}

	.token.operator {
		color: ${colors.lightest(colors.teal)};
	}

	.token.prolog {
		color: ${colors.light(colors.gray)};
	}

	.token.property {
		color: ${colors.white};
	}

	.token.pseudo-class {
		color: ${colors.light(colors.green)};
	}

	.token.pseudo-element {
		color: ${colors.light(colors.green)};
	}

	.token.punctuation {
		color: ${colors.lightest(colors.teal)};
	}

	.token.regex {
		color: ${colors.light(colors.red)};
	}

	.token.selector {
		color: ${colors.light(colors.red)};
	}

	.token.string {
		color: ${colors.light(colors.green)};
	}

	.token.symbol {
		color: ${colors.lighter(colors.purple)};
	}

	.token.tag {
		color: ${colors.light(colors.red)};
	}

	.token.unit {
		color: ${colors.light(colors.orange)};
	}

	.token.url {
		color: ${colors.light(colors.red)};
	}

	.token.variable {
		color: ${colors.light(colors.red)};
	}
`;
