import { findByRole, fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Button } from '.';

describe('Button', () => {
	test('must render a button', async () => {
		const name = 'test:button';

		new Button({ textContent: name, appendTo: container });

		await findByRole(container, 'button', { name });
	});

	test('a press fires once', async () => {
		const onPointerPress = mock(() => {});
		new Button({ textContent: 'Click me', onPointerPress, appendTo: container });

		await userEvent.setup().click(await findByRole(container, 'button'));

		expect(onPointerPress).toHaveBeenCalledTimes(1);
	});

	test('a touch that becomes a scroll is not a press', async () => {
		const onPointerPress = mock(() => {});
		new Button({ textContent: 'In a list', onPointerPress, appendTo: container });

		const element = await findByRole(container, 'button');

		// The browser sends pointercancel instead of a click once the finger starts scrolling
		fireEvent.pointerDown(element, { pointerType: 'touch' });
		fireEvent.pointerCancel(element, { pointerType: 'touch' });

		expect(onPointerPress).not.toHaveBeenCalled();
	});

	test('Enter and Space press a button once each, through its own click', async () => {
		const onPointerPress = mock(() => {});
		new Button({ textContent: 'Press me', onPointerPress, appendTo: container });

		const user = userEvent.setup();

		(await findByRole(container, 'button')).focus();

		await user.keyboard('{Enter}');
		expect(onPointerPress).toHaveBeenCalledTimes(1);

		await user.keyboard(' ');
		expect(onPointerPress).toHaveBeenCalledTimes(2);

		await user.keyboard('{Escape}');
		expect(onPointerPress).toHaveBeenCalledTimes(2);
	});

	test('a Button on another tag gets Enter and Space added', async () => {
		const onPointerPress = mock(() => {});
		const button = new Button({ tag: 'div', textContent: 'Press me', onPointerPress, appendTo: container });

		fireEvent.keyUp(button.elem, { code: 'Enter' });
		fireEvent.keyUp(button.elem, { code: 'Space' });
		fireEvent.keyUp(button.elem, { code: 'Escape' });

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
