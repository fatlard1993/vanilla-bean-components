import { findByDisplayValue, findByRole } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import TextInput from '.';

const container = new JSDOM().window.document.body;

describe('TextInput', () => {
	test('must render', async () => {
		const value = 'textValue';

		new TextInput({ value, appendTo: container });

		await findByDisplayValue(container, value);

		await findByRole(container, 'textbox');
	});
});
