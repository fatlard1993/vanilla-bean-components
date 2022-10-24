import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import View from '.';
import DomElem from '../DomElem';

const container = new JSDOM().window.document.body;

describe('View', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new View({ appendTo: container, appendChild: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
