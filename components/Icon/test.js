import { JSDOM } from 'jsdom';

import { Icon } from '.';

const container = new JSDOM().window.document.body;

describe('Icon', () => {
	test('must render', async () => {
		new Icon({ icon: 'icons', appendTo: container });
	});
});
