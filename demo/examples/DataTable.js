import { Component, Input, Button, Popover, Menu, Table, styled, delay, orderBy, randInt } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './DataTable.js.asText';

const fetchData = async ({ sort } = {}) => {
	console.log('Fetching data...');

	await delay(randInt(1000, 2000));

	const data = [
		{ id: '37618764908108', name: 'Stanley', amount: 102 },
		{ id: '65766917089182', name: 'Pam', amount: 213 },
		{ id: '87092820983330', name: 'Dwight', amount: 330 },
		{ id: '53789727773992', name: 'Creed', amount: 14 },
		{ id: '90918387737333', name: 'Jim', amount: 404 },
		{ id: '01918827728932', name: 'Oscar', amount: 890 },
		{ id: '09818717626969', name: 'Kevin', amount: 7 },
	];

	return sort ? data.sort(orderBy(sort)) : data;
};

const Loader = styled.Icon(
	({ colors }) => `
		display: flex;
		font-size: 66px;
		justify-content: center;
		color: ${colors.blue};
	`,
	{ icon: 'spinner', animation: 'spin-pulse' },
);

export default class Example extends ExampleView {
	async render() {
		this.options.exampleCode = exampleCode;

		super.render();

		new Loader({ appendTo: this.demoWrapper });

		const sortProperty = 'name';
		const sortDirection = 'asc';
		const data = await fetchData({ sort: { property: sortProperty, direction: sortDirection } });

		const table = new Table({
			data,
			sortProperty,
			sortDirection,
			selection: {},
			onSort: async (property, direction) => {
				const temporaryModalLoader = new Component(
					{
						appendTo: table,
						styles: ({ colors }) => ({
							position: 'absolute',
							top: 0,
							background: colors.black,
							opacity: 0.8,
							width: '100%',
							height: '100%',
						}),
					},
					new Loader({ style: { marginTop: 'calc(50% - 33px)' } }),
				);

				const newData = await fetchData({ sort: { property, direction } });

				table.options.data = newData;

				temporaryModalLoader.elem.remove();
			},
			columns: [
				{
					content: new Input({
						type: 'checkbox',
						style: { marginRight: 0 },
						onChange: ({ value }) => {
							table.options.selection = Object.fromEntries(data.map(({ id }) => [id, value]));
						},
					}),
					dataColumn: ({ table, rowData }) => ({
						content: new Input({
							type: 'checkbox',
							style: { marginRight: 0 },
							value: table.options.selection[rowData.id],
							onChange: ({ value }) => {
								table.options.selection[rowData.id] = value;
							},
						}),
					}),
				},
				{ sort: true, key: 'id', content: 'ID' },
				{ sort: true, key: 'name', content: 'Name' },
				{ sort: true, key: 'amount', content: 'Amount', dataColumn: { style: { textAlign: 'right' } } },
				{
					dataColumn: ({ rowData }) => ({
						content: new Button({
							icon: 'ellipsis',
							style: { marginRight: 0 },
							onPointerPress: event => {
								new Popover(
									{ state: 'auto', x: event.clientX, y: event.clientY },
									new Menu({
										items: [`Remind ${rowData.name}`, `Forgive ${rowData.name}`],
										onSelect: console.log,
									}),
								);
							},
						}),
					}),
				},
			],
		});

		this.demoWrapper.content(table);
	}
}
