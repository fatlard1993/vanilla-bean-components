import { findByRole, fireEvent } from '@testing-library/dom';

import { Button } from '.';

describe('Button', () => {
	test('must render a button', async () => {
		const name = 'test:button';

		new Button({ textContent: name, appendTo: container });

		await findByRole(container, 'button', { name });
	});

	test('handles click events', async () => {
		const onPointerPress = mock(() => {});
		new Button({
			textContent: 'Click me',
			onPointerPress,
			appendTo: container,
		});

		const element = await findByRole(container, 'button');

		// Trigger the actual pointer press event that Button listens for
		fireEvent.pointerDown(element);
		fireEvent.pointerUp(element);

		expect(onPointerPress).toHaveBeenCalledTimes(1);
	});

	test('handles keyboard events (Enter and Space)', async () => {
		const onPointerPress = mock(() => {});
		new Button({
			textContent: 'Press me',
			onPointerPress,
			appendTo: container,
		});

		const element = await findByRole(container, 'button');

		// Test Enter key
		fireEvent.keyUp(element, { code: 'Enter' });
		expect(onPointerPress).toHaveBeenCalledTimes(1);

		// Test Space key
		fireEvent.keyUp(element, { code: 'Space' });
		expect(onPointerPress).toHaveBeenCalledTimes(2);

		// Test other keys (should not trigger)
		fireEvent.keyUp(element, { code: 'Escape' });
		expect(onPointerPress).toHaveBeenCalledTimes(2);
	});

	test('extends TooltipWrapper', () => {
		const button = new Button({
			textContent: 'Test',
			tooltip: 'Button tooltip',
			appendTo: container,
		});

		expect(button.options.tooltip).toBe('Button tooltip');
		expect(button.elem.tagName).toBe('BUTTON');
	});

	test('accepts custom options', () => {
		const button = new Button({
			textContent: 'Custom',
			disabled: true,
			className: 'custom-button',
			appendTo: container,
		});

		expect(button.elem.disabled).toBe(true);
		expect(button.elem.className).toContain('custom-button');
	});
});
