import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { DomElem } from '../';

import Modal from '.';

const container = new JSDOM().window.document.body;

describe('Modal', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Modal({ appendTo: container, appendChild: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
