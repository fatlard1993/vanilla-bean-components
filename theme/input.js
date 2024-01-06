import colors from './colors';

export default `
	display: block;
	border-radius: 3px;
	border: inset 3px ${colors.lightest(colors.teal).setAlpha(0.8)};
	box-sizing: border-box;
	width: 100%;
	color: ${colors.light(colors.red)};
	background-color: ${colors.black};
	outline-color: ${colors.lighter(colors.orange)};
	padding: 2px 6px;

	&:disabled {
		color: ${colors.black};
		background-color: ${colors.darker(colors.gray)};
	}

	&[type='number'] {
		color: ${colors.light(colors.orange)};
		background-color: ${colors.black};
	}
`;
