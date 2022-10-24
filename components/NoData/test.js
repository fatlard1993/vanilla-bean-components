import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import NoData from '.';

const container = new JSDOM().window.document.body;

describe('NoData', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new NoData({ textContent, appendTo: container });

		await findByText(container, textContent);
	});
});
