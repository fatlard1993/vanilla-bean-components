import { findByDisplayValue } from '@testing-library/dom';

import { Input } from '.';

describe('Input', () => {
	test('must render', async () => {
		const value = 'textValue';

		new Input({ value, appendTo: container });

		await findByDisplayValue(container, value);
	});

	test('must provide dirty state tracking', async () => {
		const value = 'textValue';

		const input = new Input({ value, appendTo: container });

		await findByDisplayValue(container, value);

		expect(input.isDirty, false);

		input.value = 'tempValue';

		expect(input.isDirty, true);

		input.value = value;

		expect(input.isDirty, false);
	});
});
