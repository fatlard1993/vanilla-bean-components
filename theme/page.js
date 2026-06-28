import _button from './button';
import _code from './code';
import colors from './colors';
import fonts from './fonts';
import _input, { number, checkbox } from './input';
import _scrollbar from './scrollbar';
import _table from './table';

export default theme => `
	html {
		height: 100%;
	}

	body {
		display: flex;
		position: relative;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		overflow: hidden;
		line-height: normal;
		tab-size: 2;
		background: ${colors.black};
		color: ${colors.white};
		margin: 0;
	}

	* {
		touch-action: manipulation;
		-webkit-text-size-adjust: none;

		font-size: 16px;
		${fonts.kodeMono}

		sub, sup {
			font-size: smaller;
		}
	}

	#app {
		width: 100%;
		height: 100%;
	}

	h1, h2, h3, h4, h5, h6 {
		color: ${colors.green};

		&:before {
			margin-right: 3px;
			font-size: 0.7em;
			opacity: 0.7;
		}
	}

	h1 {
		font-size: 30px;

		&:first-child {
			margin-top: 0;
		}

		&:before {
			content: "#";
		}
	}

	h2 {
		font-size: 24px;

		&:before {
			content: "##";
		}
	}

	h3 {
		font-size: 18px;

		&:before {
			content: "###";
		}
	}

	h4 {
		font-size: 18px;

		&:before {
			content: "####";
		}
	}

	h5 {
		font-size: 18px;

		&:before {
			content: "#####";
		}
	}

	h6 {
		font-size: 18px;

		&:before {
			content: "######";
		}
	}

	a {
		color: ${colors.light(colors.blue)};

		&:visited {
			color: ${colors.light(colors.purple)};
		}

		&.disabled {
			pointer-events: none;

			&:hover .tooltip {
				display: none;
			}
		}
	}

	@viewport {
		width: device-width;
		zoom: 1;
		min-zoom: 1;
		max-zoom: 1;
	}

	${_code(theme)}

	${_scrollbar(theme)}

	input, select, textarea { ${_input(theme)} }
	${number(theme)}
	${checkbox(theme)}

	button, a.variant-button, kbd { ${_button(theme)} }

	kbd {
		background-color: ${colors.dark(colors.gray)};
		padding: 4px 6px 6px 6px;
	}

	table { ${_table(theme)} }

	blockquote {
		background-color: ${colors.white.setAlpha(0.06)};
    border-left: 6px solid ${colors.white.setAlpha(0.06)};
    margin: 0;
    padding: 1px 12px;

		&.NOTE {
			background-color: ${colors.alpha(colors.blue, 0.09)};
			border-color: ${colors.alpha(colors.blue, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.blue)};
			}
		}

		&.TIP {
			background-color: ${colors.alpha(colors.green, 0.09)};
			border-color: ${colors.alpha(colors.green, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.green)};
			}
		}

		&.IMPORTANT {
			background-color: ${colors.alpha(colors.purple, 0.09)};
			border-color: ${colors.alpha(colors.purple, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.purple)};
			}
		}

		&.WARNING {
			background-color: ${colors.alpha(colors.yellow, 0.09)};
			border-color: ${colors.alpha(colors.yellow, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.yellow)};
			}
		}

		&.CAUTION {
			background-color: ${colors.alpha(colors.red, 0.09)};
			border-color: ${colors.alpha(colors.red, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.red)};
			}
		}
	}

	.fa-support:before {
		${fonts.fontAwesomeSolid}
		content: var(--fa);
	}
`;
