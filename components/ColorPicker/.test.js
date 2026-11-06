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

describe('ColorPicker typed values', () => {
	test('half-typed text is not taken for a color', () => {
		const picker = new ColorPicker({ value: 'hsl(120, 50%, 50%)', appendTo: container });

		picker.change('#f');

		expect(picker.options.value).toBe('hsl(120, 50%, 50%)');

		picker.change('#ff0000');

		expect(picker.options.value).toBe('hsl(0, 100%, 50%)');
	});
});

describe('ColorPicker colors', () => {
	test('parses a color into its parts and its hsl string', () => {
		const picker = new ColorPicker({ appendTo: container });
		const red = picker.parseValue('#ff0000');

		expect(red.hslString).toBe('hsl(0, 100%, 50%)');
		expect([red.h, red.sv, red.v]).toEqual([0, 1, 1]);
		expect(picker.parseValue({ h: 120, s: 0.5, l: 0.5 }).hslString).toBe('hsl(120, 50%, 50%)');
		expect(picker.parseValue('random').color.isValid).toBe(true);
	});

	test('a value fills the picker, writes the field and sets the hue', () => {
		const picker = new ColorPicker({ value: '#00ff00', appendTo: container });

		expect(picker.hue).toBe(120);
		expect(picker.elem.style.backgroundColor).toContain('120');
		expect(picker.textInput.elem.value).toBe('hsl(120, 100%, 50%)');

		picker.options.value = '#0000ff';

		expect(picker.hue).toBe(240);
		expect(picker.textInput.elem.value).toBe('hsl(240, 100%, 50%)');
	});

	test('a gray keeps the hue it had, so the hue slider stays where it was', () => {
		const picker = new ColorPicker({ value: 'hsl(200, 50%, 50%)', appendTo: container });

		picker.options.value = '#808080';

		expect(picker.hue).toBeCloseTo(200);
	});

	test('random is a color', () => {
		const picker = new ColorPicker({ value: 'random', appendTo: container });

		expect(picker.options.value).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
	});

	test('a swatch is a button that picks its color and announces the change', () => {
		const onChange = mock();
		const picker = new ColorPicker({ swatches: ['#ff0000', '#00ff00'], onChange, appendTo: container });
		// eslint-disable-next-line testing-library/no-node-access
		const swatches = picker.elem.querySelectorAll('.vbc-button');

		expect(swatches).toHaveLength(2);

		swatches[1].click();

		expect(picker.options.value).toBe('hsl(120, 100%, 50%)');
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0].detail.value).toBe('hsl(120, 100%, 50%)');
	});

	test('hsl and hsv convert back and forth', () => {
		const { h, sv, v } = ColorPicker.hslToHsv(30, 0.5, 0.4);
		const back = ColorPicker.hsvToHsl(h, sv, v);

		expect(back.h).toBe(30);
		expect(back.s).toBeCloseTo(0.5);
		expect(back.l).toBeCloseTo(0.4);
	});
});
