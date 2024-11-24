import { Table } from '.';

describe('Table', () => {
	test('must render', async () => {
		new Table({ appendTo: container, data: [], columns: [], footer: [] });
	});
});
