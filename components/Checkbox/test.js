import { JSDOM } from 'jsdom';

import { Checkbox } from '.';

const container = new JSDOM().window.document.body;

describe('Checkbox', () => {
	test('must render', async () => {
		new Checkbox({ appendTo: container });
	});
});
