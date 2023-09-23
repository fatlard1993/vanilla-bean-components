import { findByText } from '@testing-library/dom';

import { DomElem } from '..';

import { Overlay } from '.';

describe('Overlay', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Overlay({ appendTo: container, append: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
