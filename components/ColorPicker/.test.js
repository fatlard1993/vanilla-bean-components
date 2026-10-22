import { findByDisplayValue, findByRole, fireEvent } from '@testing-library/dom';

import { ColorPicker, ColorSwatch } from '.';

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

describe('ColorSwatch', () => {
	test('a color fills it, with text that reads on the fill', async () => {
		new ColorSwatch({ color: '#ffff00', title: 'yellow', appendTo: container });
		const swatch = await findByRole(container, 'button', { name: 'yellow' });

		expect(swatch.style.backgroundColor).toMatch(/#ffff00|rgb\(255, 255, 0\)/);
		expect(swatch.style.color).not.toBe('');
		expect(swatch).not.toHaveClass('rainbow');
	});

	test("'random' cycles the hues instead of showing one, and a new color stops it", async () => {
		const swatch = new ColorSwatch({ color: 'random', title: 'random', appendTo: container });
		const button = await findByRole(container, 'button', { name: 'random' });

		expect(button).toHaveClass('rainbow');
		expect(button.style.backgroundColor).toBe('');

		swatch.options.color = '#0000ff';

		expect(button).not.toHaveClass('rainbow');
		expect(button.style.backgroundColor).not.toBe('');
	});
});
