import { findByDisplayValue } from '@testing-library/dom';
import { JSDOM } from 'jsdom';
import { expect } from 'vitest';

import Input from '.';

const container = new JSDOM().window.document.body;

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

		expect(input.isDirty(), false);

		input.elem.value = 'tempValue';

		expect(input.isDirty(), true);

		input.elem.value = value;

		expect(input.isDirty(), false);
	});
});
