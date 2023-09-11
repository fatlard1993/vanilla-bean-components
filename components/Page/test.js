import { findByText } from '@testing-library/dom';

import { DomElem } from '..';

import { Page } from '.';

describe('Page', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Page({ appendTo: container, append: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
