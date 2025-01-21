import { findByText } from '@testing-library/dom';

import { Component } from '../..';

import { Notify } from '.';

describe('Notify', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Notify({ appendTo: container, append: new Component({ textContent }) });

		await findByText(container, textContent);
	});
});
