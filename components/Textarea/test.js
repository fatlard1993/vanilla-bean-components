import { findByDisplayValue } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Textarea from '.';

const container = new JSDOM().window.document.body;

describe('Textarea', () => {
	test('must render', async () => {
		const value = 'textValue';

		new Textarea({ value, appendTo: container });

		await findByDisplayValue(container, value);
	});
});
