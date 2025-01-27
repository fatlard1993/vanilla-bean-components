import colors from './colors';

export default `
	::-webkit-scrollbar {
		width: 24px;
		height: 24px;
		background: ${colors.white.setAlpha(0.06)};
	}
	::-webkit-scrollbar-button {
		width: 6px;
		height: 6px;
	}
	::-webkit-scrollbar-thumb {
		background: ${colors.white.setAlpha(0.06)};
		-webkit-box-shadow: inset 0 0 2px 1px ${colors.blue};
		border-radius: 12px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: ${colors.white.setAlpha(0.09)};
		-webkit-box-shadow: inset 0 0 3px 1px ${colors.blue};
	}
	::-webkit-scrollbar-thumb:active {
		background: ${colors.white.setAlpha(0.12)};
		-webkit-box-shadow: inset 0 0 4px 2px ${colors.blue};
	}
`;
