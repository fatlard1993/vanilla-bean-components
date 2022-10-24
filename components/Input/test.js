import { findByDisplayValue } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Input from '.';

const container = new JSDOM().window.document.body;

describe('Input', () => {
	test('must render', async () => {
		const value = 'textValue';

		new Input({ value, appendTo: container });

		await findByDisplayValue(container, value);
	});
});
