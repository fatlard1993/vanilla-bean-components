const fontAwesome = `
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased;
	display: inline-block;
	font-style: normal;
	font-variant: normal;
	text-rendering: auto;
	line-height: 1;
	font-family: 'Font Awesome 5 Free';
	font-weight: 400;
`;

export const fonts = {
	fontAwesome,
	fontAwesomeBrands: `
		${fontAwesome}

		font-family: 'Font Awesome 5 Brands';
		font-weight: normal;
	`,
	fontAwesomeSolid: `
		${fontAwesome}

		font-weight: 600;
	`,
};

export default fonts;
