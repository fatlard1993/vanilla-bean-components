import colors from './colors';

export const input = `
	display: block;
	border-radius: 3px;
	text-indent: 3px;
	border: inset 3px ${colors.light(colors.grey)};
	box-sizing: border-box;
	width: 100%;

	&:disabled {
		color: ${colors.black};
		background-color: ${colors.darker(colors.grey)};
	}
`;

export default input;
