import { radius } from './tokens';

export const number = (_theme, selector = "input:where([type='number'])") => `
	${selector} {
		font-variant-numeric: tabular-nums;
	}
`;

export const checkbox = ({ colors }, selector = "input:where([type='checkbox'])") => `
	${selector} {
		/* Remove most all native input styles */
		appearance: none;
		padding: 0;
		background-color: transparent;
		box-shadow: none;

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
			box-shadow: inset 1em 1em ${colors.selected};
		}

		&:focus {
			border: 0.15em solid currentColor;
		}
	}
`;

export default ({ colors }) => `
	display: block;
	box-sizing: border-box;
	width: 100%;
	line-height: 1.25;
	padding: 5px 8px;
	border: 1px solid ${colors.alpha(colors.white, 0.15)};
	border-radius: ${radius.sm};
	color: ${colors.white};
	background-color: ${colors.alpha(colors.white, 0.06)};
	accent-color: ${colors.selected};
	outline: none;
	transition: border-color 0.15s, box-shadow 0.15s;

	/* A select's list is drawn on its own, with nothing behind a translucent fill */
	& option {
		background-color: ${colors.black};
		color: ${colors.white};
	}

	&::placeholder {
		color: ${colors.alpha(colors.white, 0.35)};
	}

	&:focus, &:focus-within {
		border-color: ${colors.light(colors.blue)};
		box-shadow: 0 0 0 2px ${colors.alpha(colors.blue, 0.35)};
	}

	&:disabled {
		color: ${colors.alpha(colors.white, 0.4)};
		background-color: ${colors.alpha(colors.white, 0.03)};
	}

	&:not(.syntax-highlighting).validation-errors {
		border-color: ${colors.light(colors.red)};
		background-color: ${colors.alpha(colors.red, 0.2)};
	}
`;
