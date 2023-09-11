import { findByText } from '@testing-library/dom';

import { DomElem } from '.';

describe('DomElem', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new DomElem({ textContent, appendTo: container });

		await findByText(container, textContent);
	});

	test('must render children', async () => {
		const textContent = 'textContent';

		new DomElem({ appendTo: container }, new DomElem({ textContent, appendTo: container }));

		await findByText(container, textContent);
	});
});
