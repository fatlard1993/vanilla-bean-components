import colors from './colors';

export default `
	border-collapse: collapse;

	thead {
		background-color: ${colors.gray.darken(38)};
	}

	tbody {
		background-color: ${colors.black};
	}

	tfoot {
		background-color: ${colors.gray.darken(36)};
	}

	tr {
		color: ${colors.light(colors.gray)};
	}

	thead, tbody > tr:not(:last-of-type) {
		border-bottom: 1px solid ${colors.gray};
	}

	tfoot {
		border-top: 1px solid ${colors.gray};
		color: ${colors.lighter(colors.gray)};
	}

	th, td {
		padding: 9px;
	}

	th:not(:first-of-type), td:not(:first-of-type) {
		border-left: 1px solid ${colors.gray};
	}

	th {
		font-weight: 900;
		color: ${colors.lightest(colors.gray)};
	}

	tr:hover {
		background-color: ${colors.blackish(colors.blue)};
		color: ${colors.lighter(colors.gray)};
	}

	td:hover, th:hover {
		background-color: ${colors.blue.darken(32)};
		color: ${colors.white};
	}
`;
