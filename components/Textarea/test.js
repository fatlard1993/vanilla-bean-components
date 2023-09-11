import { findByDisplayValue } from '@testing-library/dom';

import { Textarea } from '.';

describe('Textarea', () => {
	test('must render', async () => {
		const value = 'textValue';

		new Textarea({ value, appendTo: container });

		await findByDisplayValue(container, value);
	});
});
