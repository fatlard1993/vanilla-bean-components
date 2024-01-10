import { findByDisplayValue, findByRole, fireEvent } from '@testing-library/dom';

import { ColorPicker } from '.';

describe('ColorPicker', () => {
	test('must provide a text based interface', async () => {
		new ColorPicker({ appendTo: container });

		await findByRole(container, 'textbox');

		fireEvent.change(await findByRole(container, 'textbox'), { target: { value: 'hsl(123, 50%, 50%)' } });

		await findByDisplayValue(container, 'hsl(123, 50%, 50%)');
	});
});
