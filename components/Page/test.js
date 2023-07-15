import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { DomElem } from '..';

import { Page } from '.';

const container = new JSDOM().window.document.body;

describe('Page', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Page({ appendTo: container, append: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
