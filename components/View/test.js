import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { DomElem } from '..';

import { View } from '.';

const container = new JSDOM().window.document.body;

describe('View', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new View({ appendTo: container, append: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
