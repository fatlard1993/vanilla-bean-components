import button from './button';
import code from './code';
import colors from './colors';
import fonts from './fonts';
import input, { number, checkbox } from './input';
import scrollbar from './scrollbar';
import table from './table';

export default `
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

	${code}

	${scrollbar}

	input, select, textarea { ${input} }
	${number}
	${checkbox}

	button, a.variant-button, kbd { ${button} }

	kbd {
		background-color: ${colors.dark(colors.gray)};
		padding: 4px 6px 6px 6px;
	}

	table { ${table} }

	blockquote {
		background-color: ${colors.white.setAlpha(0.06)};
    border-left: 6px solid ${colors.white.setAlpha(0.06)};
    margin: 0;
    padding: 1px 12px;

		&.NOTE {
			background-color: ${colors.blue.setAlpha(0.09)};
			border-color: ${colors.blue.setAlpha(0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.blue)};
			}
		}

		&.TIP {
			background-color: ${colors.green.setAlpha(0.09)};
			border-color: ${colors.green.setAlpha(0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.green)};
			}
		}

		&.IMPORTANT {
			background-color: ${colors.purple.setAlpha(0.09)};
			border-color: ${colors.purple.setAlpha(0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.purple)};
			}
		}

		&.WARNING {
			background-color: ${colors.yellow.setAlpha(0.09)};
			border-color: ${colors.yellow.setAlpha(0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.yellow)};
			}
		}

		&.CAUTION {
			background-color: ${colors.red.setAlpha(0.09)};
			border-color: ${colors.red.setAlpha(0.3)};

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
