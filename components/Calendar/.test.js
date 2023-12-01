import { Calendar } from '.';

describe('Calendar', () => {
	test('must render', async () => {
		new Calendar({ appendTo: container });
	});
});
