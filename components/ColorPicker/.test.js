import { findByDisplayValue, findByRole, fireEvent } from '@testing-library/dom';

import { ColorPicker } from '.';

describe('ColorPicker', () => {
	test('must provide a text based interface', async () => {
		new ColorPicker({ appendTo: container });

		await findByRole(container, 'textbox');

		fireEvent.change(await findByRole(container, 'textbox'), { target: { value: 'rgb(0, 0, 255)' } });

		await findByDisplayValue(container, 'rgb(0, 0, 255)');
	});
});
