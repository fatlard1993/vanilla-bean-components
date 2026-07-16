import { Table } from '.';

describe('Table', () => {
	let table;

	afterEach(() => {
		table?.destroy?.();
		table = null;
		document.body.replaceChildren();
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
