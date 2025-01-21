import { findByText } from '@testing-library/dom';

import { Component } from '../..';

import { Page } from '.';

describe('Page', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Page({ appendTo: container, append: new Component({ textContent }) });

		await findByText(container, textContent);
	});
});
