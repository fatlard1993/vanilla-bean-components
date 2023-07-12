import colors from './colors';

export default `
	display: block;
	border-radius: 3px;
	text-indent: 3px;
	border: inset 3px ${colors.light(colors.gray)};
	box-sizing: border-box;
	width: 100%;

	&:disabled {
		color: ${colors.black};
		background-color: ${colors.darker(colors.gray)};
	}
`;
