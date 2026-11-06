import { Table } from '.';

describe('Table', () => {
	test('must render', async () => {
		new Table({ appendTo: container, data: [], columns: [], footer: [] });
	});
});

describe('Table', () => {
	let table;

	afterEach(() => {
		table?.destroy?.();
		table = null;
		document.body.replaceChildren();
	});

	describe('cells', () => {
		test('a keyed column shows its value', () => {
			table = new Table({ appendTo: document.body, columns: ['name'], data: [{ name: 'Alice' }] });

			expect(table.elem.querySelector('tbody td').textContent).toBe('Alice');
		});

		test('a keyed column whose cell brings its own content shows only that content', () => {
			table = new Table({
				appendTo: document.body,
				columns: [
					{
						key: 'status',
						content: 'Status',
						sort: true,
						dataColumn: ({ rowData }) => ({ content: `[${rowData.status}]` }),
					},
				],
				data: [{ status: 'open' }],
			});

			expect(table.elem.querySelector('tbody td').textContent).toBe('[open]');
		});

		test('a cell that only styles itself still shows the keyed value', () => {
			table = new Table({
				appendTo: document.body,
				columns: [{ key: 'effort', dataColumn: { style: { textAlign: 'right' } } }],
				data: [{ effort: 3 }],
			});

			expect(table.elem.querySelector('tbody td').textContent).toBe('3');
			expect(table.elem.querySelector('tbody td').style.textAlign).toBe('right');
		});
	});

	describe('reactive options', () => {
		test('re-renders when columns change, including string-form columns', () => {
			table = new Table({
				appendTo: document.body,
				columns: ['name'],
				data: [{ name: 'a', age: 1 }],
			});

			expect(table.elem.querySelectorAll('th').length).toBe(1);
			expect(table.elem.querySelector('th').textContent).toBe('Name');

			table.options.columns = ['name', 'age'];

			expect(table.elem.querySelectorAll('th').length).toBe(2);
			expect(table.elem.querySelectorAll('tbody td').length).toBe(2);
			expect(table.elem.querySelectorAll('tbody td')[1].textContent).toBe('1');
		});

		test('re-renders when footer changes', () => {
			table = new Table({
				appendTo: document.body,
				columns: ['name'],
				data: [{ name: 'a' }],
			});

			expect(table.elem.querySelectorAll('tfoot td').length).toBe(0);

			table.options.footer = ['total'];

			expect(table.elem.querySelectorAll('tfoot td').length).toBe(1);
			expect(table.elem.querySelector('tfoot td').textContent).toBe('Total');
		});
	});
});

describe('Table sorting and data', () => {
	const cells = table => Array.from(table.elem.querySelectorAll('tbody td'), td => td.textContent);
	const settle = () => new Promise(resolve => setTimeout(resolve, 0));

	test('pressing a sortable header reorders the rows shown and leaves the data as given', () => {
		const data = [{ n: 2 }, { n: 1 }, { n: 3 }];
		const table = new Table({ appendTo: container, columns: [{ key: 'n', content: 'N', sort: true }], data });

		table.elem.querySelector('th').click();

		expect(cells(table)).toEqual(['3', '2', '1']);
		expect(data.map(({ n }) => n)).toEqual([2, 1, 3]);

		table.elem.querySelector('th').click();

		expect(cells(table)).toEqual(['1', '2', '3']);
	});

	test('a sortable header is pressed from the keyboard too, as a column header still', () => {
		const table = new Table({
			appendTo: container,
			columns: [{ key: 'n', content: 'N', sort: true }],
			data: [{ n: 2 }, { n: 1 }],
		});
		const th = table.elem.querySelector('th');

		th.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		expect(cells(table)).toEqual(['2', '1']);
		expect(th.tabIndex).toBe(0);
		expect(th.hasAttribute('role')).toBe(false);
	});

	test('an initial sort applies to the rows', () => {
		const table = new Table({
			appendTo: container,
			columns: ['n'],
			data: [{ n: 2 }, { n: 1 }],
			sortProperty: 'n',
			sortDirection: 'asc',
		});

		expect(cells(table)).toEqual(['1', '2']);
	});

	test('no data leaves no rows', () => {
		const table = new Table({ appendTo: container, columns: ['n'], data: [{ n: 1 }] });

		table.options.data = null;

		expect(cells(table)).toEqual([]);
	});

	test('rendering again still shows the rows', async () => {
		const table = new Table({ appendTo: container, columns: ['n'], data: [{ n: 1 }] });

		table.render();
		await settle();

		expect(cells(table)).toEqual(['1']);
	});
});
