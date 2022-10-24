import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Menu from '.';

const container = new JSDOM().window.document.body;

describe('Menu', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Menu({ items: [{ textContent }], appendTo: container });

		await findByText(container, textContent);
	});
});
