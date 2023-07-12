import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { DomElem } from '.';

const container = new JSDOM().window.document.body;

describe('DomElem', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new DomElem({ textContent, appendTo: container });

		await findByText(container, textContent);
	});
});
