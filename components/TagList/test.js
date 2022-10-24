import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import TagList from '.';

const container = new JSDOM().window.document.body;

describe('TagList', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new TagList({ tags: [textContent], appendTo: container });

		await findByText(container, textContent);
	});
});
