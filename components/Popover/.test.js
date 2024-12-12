import { findByText } from '@testing-library/dom';

import { Component } from '..';

import { Popover } from '.';

describe('Popover', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Popover({ appendTo: container, append: new Component({ textContent }) });

		await findByText(container, textContent);
	});
});
