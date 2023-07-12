import { findByDisplayValue, findByRole, findByText, fireEvent } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { ColorPicker } from '.';

const container = new JSDOM().window.document.body;

describe('ColorPicker', () => {
	test('must provide a built-in label', async () => {
		const label = 'test:ColorPicker';

		new ColorPicker({ label, appendTo: container });

		await findByText(container, label);
	});

	test('must provide a text based interface', async () => {
		new ColorPicker({ appendTo: container });

		await findByRole(container, 'textbox');

		await findByDisplayValue(container, '#666');

		fireEvent.change(await findByRole(container, 'textbox'), { target: { value: 'rgb(0, 0, 255)' } });

		await findByDisplayValue(container, 'rgb(0, 0, 255)');
	});
});
