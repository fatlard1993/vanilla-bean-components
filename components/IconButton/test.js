import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import IconButton from '.';

const container = new JSDOM().window.document.body;

describe('IconButton', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new IconButton({ textContent, appendTo: container });

		await findByText(container, textContent);
	});
});
