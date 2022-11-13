import { findByRole } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Link from '.';

const container = new JSDOM().window.document.body;

describe('Link', () => {
	test('must render', async () => {
		const textContent = 'textContent';
		const href = 'testHref';

		new Link({ textContent, href, appendTo: container });

		expect(await findByRole(container, 'link', { name: textContent }).href, href);
	});
});
