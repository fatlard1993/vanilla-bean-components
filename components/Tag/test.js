import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Tag from '.';

const container = new JSDOM().window.document.body;

describe('Tag', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Tag({ textContent, appendTo: container });

		await findByText(container, textContent);
	});
});
