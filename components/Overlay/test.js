import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { DomElem } from '../';

import Overlay from '.';

const container = new JSDOM().window.document.body;

describe('Overlay', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Overlay({ appendTo: container, appendChild: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
