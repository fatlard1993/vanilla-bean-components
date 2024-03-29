import { findByRole } from '@testing-library/dom';

import { Link } from '.';

describe('Link', () => {
	test('must render', async () => {
		const textContent = 'textContent';
		const href = 'testHref';

		new Link({ textContent, href, appendTo: container });

		const link = await findByRole(container, 'link', { name: textContent });

		expect(link.href, href);
	});
});
