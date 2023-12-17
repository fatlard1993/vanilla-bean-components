import { findByText } from '@testing-library/dom';

import { DomElem } from '..';

import { Notify } from '.';

describe('Notify', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Notify({ appendTo: container, append: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
