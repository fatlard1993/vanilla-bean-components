import { Code } from '.';

describe('Code', () => {
	test('must render', async () => {
		const code = 'code';

		new Code({ code, appendTo: container });
	});
});
