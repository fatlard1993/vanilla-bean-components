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

		for (const key of ['Enter', ' ', 'Escape']) {
			fireEvent.keyDown(button.elem, { key });
			fireEvent.keyUp(button.elem, { key });
		}

		expect(onPointerPress).toHaveBeenCalledTimes(2);
		expect(button.elem).toHaveAttribute('role', 'button');
		expect(button.elem.tabIndex).toBe(0);
	});

	test('a held Enter presses once; Space presses as it comes up', () => {
		const onPointerPress = mock(() => {});
		const button = new Button({ tag: 'div', onPointerPress, appendTo: container });

		fireEvent.keyDown(button.elem, { key: 'Enter' });
		fireEvent.keyDown(button.elem, { key: 'Enter', repeat: true });
		expect(onPointerPress).toHaveBeenCalledTimes(1);

		fireEvent.keyDown(button.elem, { key: ' ' });
		expect(onPointerPress).toHaveBeenCalledTimes(1);
		fireEvent.keyUp(button.elem, { key: ' ' });
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

	test('a Button carries the class the theme gives its look to, and a flat variant', () => {
		const plain = new Button({ textContent: 'Plain', addClass: 'mine', appendTo: container });
		const flat = new Button({ textContent: 'Flat', variant: 'flat', appendTo: container });

		expect(plain.elem).toHaveClass('vbc-button', 'mine');
		expect(flat.elem).toHaveClass('vbc-button', 'variant-flat');

		flat.options.variant = null;

		expect(flat.elem).not.toHaveClass('variant-flat');
		expect(() => new Button({ variant: 'loud' })).toThrow();
	});

	test('intent marks what pressing it does, apart from its look', () => {
		const remove = new Button({ textContent: 'Delete', intent: 'danger', variant: 'flat', appendTo: container });

		expect(remove.elem).toHaveClass('intent-danger', 'variant-flat');

		remove.options.intent = 'success';

		expect(remove.elem).toHaveClass('intent-success');
		expect(remove.elem).not.toHaveClass('intent-danger');
		expect(() => new Button({ intent: 'error' })).toThrow('"error" is not a valid intent');
	});
});
