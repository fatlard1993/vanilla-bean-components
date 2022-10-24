import { findByDisplayValue } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import NumberInput from '.';

const container = new JSDOM().window.document.body;

describe('NumberInput', () => {
	test('must render', async () => {
		const value = 42;

		new NumberInput({ value, appendTo: container });

		await findByDisplayValue(container, value);
	});
});
