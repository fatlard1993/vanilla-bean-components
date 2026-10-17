import { Table } from '.';

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
