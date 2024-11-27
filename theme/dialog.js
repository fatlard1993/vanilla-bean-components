import colors from './colors';

export default `
	display: none;
	background-color: ${colors.darkest(colors.gray)};
	color: ${colors.white};
	border-radius: 3px;
	flex-direction: column;
	padding: 6px;
	margin: 0 auto;
	border: 2px solid ${colors.dark(colors.blue)};
	top: 50%;
	transform: translateY(-50%);

	--aug-border-bg: linear-gradient(-12deg, ${colors.light(colors.teal)}, ${colors.light(colors.blue)});
	--aug-border-all: 2px;
	--aug-tl1: 24px;
	--aug-tr-extend1: 42%;
	--aug-tr1: 24px;
	--aug-bl-extend2: 32px;
	--aug-br1: 12px;

	/* Default size: small */
	width: 420px;
	height: 210px;

	&.standard {
		width: 840px;
		height: 420px;
	}

	&.large {
		width: 90vw;
		height: 90vh;
	}

	&::backdrop {
		background-color: ${colors.blackish(colors.blue).setAlpha(0.9)};
		backdrop-filter: blur(3px);
	}
`;
