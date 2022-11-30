import colors from './colors';

export const scrollbar = `
	::-webkit-scrollbar {
		width: 24px;
		height: 24px;
	}
	::-webkit-scrollbar-button {
		width: 6px;
		height: 6px;
	}
	::-webkit-scrollbar-thumb {
		background: ${colors.darkest(colors.grey)};
		-webkit-box-shadow: inset 0 0 2px 1px ${colors.blue};
		border-radius: 12px;
	}
	::-webkit-scrollbar-thumb:hover {
		-webkit-box-shadow: inset 0 0 3px 1px ${colors.blue};
	}
	::-webkit-scrollbar-thumb:active {
		-webkit-box-shadow: inset 0 0 4px 2px ${colors.blue};
	}
`;

export default scrollbar;
