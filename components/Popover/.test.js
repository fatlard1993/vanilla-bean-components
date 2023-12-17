import { findByText } from '@testing-library/dom';

import { DomElem } from '..';

import { Popover } from '.';

describe('Popover', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Popover({ appendTo: container, append: new DomElem({ textContent }) });

		await findByText(container, textContent);
	});
});
