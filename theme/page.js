import code from './code';
import colors from './colors';
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

		* {
			touch-action: manipulation;
			-webkit-text-size-adjust: none;

			font: 600 16px 'Source Code Pro';
			font-family: 'Source Code Pro', monospace;
			line-height: normal;
		}
	}

	#app {
		width: 100%;
		height: 100%;
	}

	h1 {
		font-size: 30px;
	}

	h2 {
		font-size: 21px;
	}

	h3, h4, h5 {
		font-size: 18px;
	}

	a {
		color: ${colors.light(colors.blue)};

		&:visited {
			color: ${colors.light(colors.purple)};
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

	table { ${table} }
`;
