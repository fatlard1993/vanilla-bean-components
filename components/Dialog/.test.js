import { findByText } from '@testing-library/dom';

import { Component } from '../..';

import { Dialog } from '.';

describe('Dialog', () => {
	test('must display a dialog', () => {
		const header = 'header';

		const dialog = new Dialog({ header, openOnRender: false, appendTo: container });

		// Check that dialog element exists directly
		expect(dialog.elem.tagName).toBe('DIALOG');
		// eslint-disable-next-line testing-library/no-node-access
		expect(container.querySelector('dialog')).toBeTruthy();
	});

	test('must support a string header', async () => {
		const header = 'header';

		new Dialog({ header, openOnRender: false, appendTo: container });

		await findByText(container, header);
	});

	test('must support a string body', async () => {
		const body = 'body';

		new Dialog({ body, openOnRender: false, appendTo: container });

		await findByText(container, body);
	});

	test('must support an element header', async () => {
		const header = new Component({ tag: 'p', textContent: 'header' });

		new Dialog({ header, openOnRender: false, appendTo: container });

		await findByText(container, 'header');
	});

	test('must support an element body', async () => {
		const body = new Component({ tag: 'p', textContent: 'body' });

		new Dialog({ body, openOnRender: false, appendTo: container });

		await findByText(container, 'body');
	});

	test('must support an element footer', async () => {
		const footer = new Component({ tag: 'p', textContent: 'footer' });

		new Dialog({ footer, openOnRender: false, appendTo: container });

		await findByText(container, 'footer');
	});

	test('must support footer buttons', async () => {
		new Dialog({ buttons: ['button1', 'button2'], openOnRender: false, appendTo: container });

		await findByText(container, 'button1');
		await findByText(container, 'button2');
	});

	test('sets size classes correctly', () => {
		const dialog = new Dialog({
			size: 'large',
			openOnRender: false,
			appendTo: container,
		});

		expect(dialog.elem.className).toContain('size-large');

		dialog.options.size = 'small';
		expect(dialog.elem.className).toContain('size-small');
		expect(dialog.elem.className).not.toContain('size-large');
	});

	test('sets variant classes correctly', () => {
		const dialog = new Dialog({
			variant: 'error',
			openOnRender: false,
			appendTo: container,
		});

		// eslint-disable-next-line testing-library/no-node-access
		const dialogElement = container.querySelector('dialog');
		expect(dialogElement.className).toContain('variant-error');

		dialog.options.variant = 'success';
		expect(dialog.elem.className).toContain('variant-success');
		expect(dialog.elem.className).not.toContain('variant-error');
	});

	test('validates size enum', () => {
		expect(() => {
			new Dialog({ size: 'invalid', openOnRender: false, appendTo: container });
		}).toThrow('"invalid" is not a valid size');
	});

	test('validates variant enum', () => {
		expect(() => {
			new Dialog({ variant: 'invalid', openOnRender: false, appendTo: container });
		}).toThrow('"invalid" is not a valid variant');
	});

	test('has correct default options', () => {
		const dialog = new Dialog({ openOnRender: false, appendTo: container });

		expect(dialog.elem.tagName).toBe('DIALOG');
		expect(dialog.options.size).toBe('small');
		expect(dialog.options.modal).toBe(true);
		expect(dialog.elem.className).toContain('size-small');
	});

	test('opens and closes dialog programmatically', () => {
		const dialog = new Dialog({
			header: 'Test',
			openOnRender: false,
			appendTo: container,
		});

		expect(dialog.elem.open).toBe(false);

		dialog.open();
		expect(dialog.elem.open).toBe(true);

		dialog.close();
		expect(dialog.elem.open).toBe(false);
	});

	test('supports button objects with options', async () => {
		new Dialog({
			buttons: [
				{ textContent: 'Save', disabled: true },
				{ textContent: 'Cancel', className: 'cancel-btn' },
			],
			openOnRender: false,
			appendTo: container,
		});

		const saveBtn = await findByText(container, 'Save');
		const cancelBtn = await findByText(container, 'Cancel');

		expect(saveBtn.disabled).toBe(true);
		expect(cancelBtn.className).toContain('cancel-btn');
	});

	test('updates header and body content dynamically', async () => {
		const dialog = new Dialog({
			header: 'Initial Header',
			body: 'Initial Body',
			openOnRender: false,
			appendTo: container,
		});

		await findByText(container, 'Initial Header');
		await findByText(container, 'Initial Body');

		dialog.options.header = 'Updated Header';
		dialog.options.body = 'Updated Body';

		await findByText(container, 'Updated Header');
		await findByText(container, 'Updated Body');
	});

	test('handles onButtonPress callback', async () => {
		const onButtonPress = mock(() => {});
		new Dialog({
			buttons: ['Test Button'],
			onButtonPress,
			openOnRender: false,
			appendTo: container,
		});

		// Access the button through testing library methods and trigger click
		const button = await findByText(container, 'Test Button');
		// Trigger the actual pointer events that Button components listen for
		button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

		expect(onButtonPress).toHaveBeenCalledWith(
			expect.objectContaining({
				button: 'Test Button',
				closeDialog: expect.any(Function),
			}),
		);
	});
});
