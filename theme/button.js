import colors from './colors';
import fonts from './fonts';

export const button = `
	display: inline-block;
	padding: 3px 12px 8px 12px;
	margin: 0 6px 3px 0;
	box-sizing: border-box;
	text-decoration: none;
	color: ${colors.white};
	background-color: ${colors.blue};
	text-align: center;
	position: relative;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	border: none;
	cursor: pointer;

	&:before {
		${fonts.fontAwesomeSolid};

		position: relative;
		pointer-events: none;
		padding: 0 6px 0 3px;
	}

	&:after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: linear-gradient(to right, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 0.05em, rgba(0, 0, 0, 0) 0.08em),
			linear-gradient(to left, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.08em, rgba(0, 0, 0, 0) 0.16em),
			linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 0.05em, rgba(0, 0, 0, 0) 0.08em),
			linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.2em, rgba(0, 0, 0, 0) 0.25em);
		pointer-events: none;
	}

	&:hover {
		top: -1px;

		&:before {
			top: -1px;
		}

		&:after {
			background-image: linear-gradient(
					to right,
					rgba(0, 0, 0, 0.3),
					rgba(0, 0, 0, 0.1) 0.05em,
					rgba(0, 0, 0, 0) 0.08em
				),
				linear-gradient(to left, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.08em, rgba(0, 0, 0, 0) 0.16em),
				linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 0.05em, rgba(0, 0, 0, 0) 0.08em),
				linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.24em, rgba(0, 0, 0, 0) 0.28em);
		}
	}
	&:focus {
		outline: none;
	}
	&:active,
	&.active,
	&.pressed {
		top: 1px;

		&:before {
			top: 1px;
		}

		&:after {
			background-image: linear-gradient(
					to right,
					rgba(0, 0, 0, 0.5),
					rgba(0, 0, 0, 0.3) 0.05em,
					rgba(0, 0, 0, 0.2) 0.08em
				),
				linear-gradient(to left, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.08em, rgba(0, 0, 0, 0) 0.16em),
				linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 0.05em, rgba(0, 0, 0, 0) 0.08em),
				linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.08em, rgba(0, 0, 0, 0) 0.16em);
		}
	}
	&.pressed {
		box-shadow: 0 0 7px 3px rgba(0, 0, 0, 40%), inset 0 0 7px 3px rgba(0, 0, 0, 40%);
	}
	&.selected {
		outline: 2px dashed ${colors.red};
	}
`;

export default button;