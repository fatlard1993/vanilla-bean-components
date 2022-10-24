import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Modal from '.';
import DomElem from '../DomElem';

const container = new JSDOM().window.document.body;

describe('Modal', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Modal({ appendTo: container, appendChild: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
