import { space } from './tokens';

export default ({ colors }) => `
	position: relative;
	border-collapse: collapse;

	thead {
		background-color: ${colors.gray.darken(38)};
		text-align: left;
	}

	tbody {
		background-color: ${colors.black};
	}

	tfoot {
		background-color: ${colors.gray.darken(36)};
	}

	tr {
		color: ${colors.muted};
	}

	thead, tbody > tr:not(:last-of-type) {
		border-bottom: 1px solid ${colors.border};
	}

	tfoot {
		border-top: 1px solid ${colors.border};
		color: ${colors.lighter(colors.gray)};
	}

	th, td {
		padding: ${space.sm} ${space.md};
	}

	th:not(:first-of-type), td:not(:first-of-type) {
		border-left: 1px solid ${colors.border};
	}

	th {
		font-weight: 900;
		color: ${colors.lightest(colors.gray)};
	}

	tr:hover {
		background-color: ${colors.blackish(colors.selected)};
		color: ${colors.lighter(colors.gray)};
	}

	td:hover, th:hover {
		background-color: ${colors.selected.darken(32)};
		color: ${colors.white};
	}
`;
