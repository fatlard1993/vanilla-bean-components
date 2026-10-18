import { findByDisplayValue, findByRole, fireEvent } from '@testing-library/dom';

import { ColorPicker } from '.';

describe('ColorPicker', () => {
	test('must provide a text based interface', async () => {
		new ColorPicker({ appendTo: container });

		await findByRole(container, 'textbox');

		fireEvent.change(await findByRole(container, 'textbox'), { target: { value: 'hsl(123, 50%, 50%)' } });

		await findByDisplayValue(container, 'hsl(123, 50%, 50%)');
	});

	test('a typed color reaches onChange once', async () => {
		const onChange = mock();
		const picker = new ColorPicker({ value: '#ff0000', onChange, appendTo: container });

		picker.textInput.elem.value = '#00ff00';
		picker.textInput.elem.dispatchEvent(new Event('change', { bubbles: true }));
		await new Promise(resolve => setTimeout(resolve, 50));

		expect(onChange).toHaveBeenCalledTimes(1);
	});
});
