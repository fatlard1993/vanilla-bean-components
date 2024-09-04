import colors from './colors';

export const number = `
	input[type='number'] {
		color: ${colors.light(colors.orange)};
		background-color: ${colors.black};
	}
`;

export const checkbox = `
	input[type='checkbox'] {
		/* Remove most all native input styles */
		appearance: none;

		margin: 0;
		margin-right: 6px;
		font: inherit;
		color: currentColor;
		width: 1.15em;
		height: 1.15em;
		border: 0.15em solid currentColor;
		border-radius: 3px;
		transform: translateY(-0.075em);
		display: inline-grid;
		place-content: center;
		cursor: pointer;

		&:before {
			content: "";
			width: 0.65em;
			height: 0.65em;
			border-radius: 2px;
		}

		&:checked:before {
			box-shadow: inset 1em 1em ${colors.blue};
		}

		&:focus {
			border: 0.15em solid currentColor;
		}
	}
`;

export default `
	display: block;
	border-radius: 3px;
	border: inset 3px ${colors.lightest(colors.teal).setAlpha(0.8)};
	box-sizing: border-box;
	width: 100%;
	color: ${colors.light(colors.red)};
	accent-color: ${colors.blue};
	background-color: ${colors.black};
	outline-color: ${colors.lighter(colors.orange)};
	padding: 2px 6px;

	&:disabled {
		color: ${colors.black};
		background-color: ${colors.darker(colors.gray)};
	}

	&:not(.syntaxHighlighting).validationErrors {
		background-color: ${colors.dark(colors.red)};
		color: ${colors.white};
	}
`;
