import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { Tooltip } from '.';

const container = new JSDOM().window.document.body;

describe('Tooltip', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Tooltip({ textContent, appendTo: container });

		await findByText(container, textContent);
	});
});
