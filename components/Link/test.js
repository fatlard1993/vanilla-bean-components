import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Link from '.';

const container = new JSDOM().window.document.body;

describe('Link', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Link({ textContent, appendTo: container });

		await findByText(container, textContent);
	});
});
