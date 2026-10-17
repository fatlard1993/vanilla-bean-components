import { findByText, getAllByRole, getByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Component, Button, List } from '../..';

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
		button.click();

		expect(onButtonPress).toHaveBeenCalledWith(
			expect.objectContaining({
				button: 'Test Button',
				closeDialog: expect.any(Function),
			}),
		);
	});

	test('rebuilds footer when buttons option changes', async () => {
		const dialog = new Dialog({ buttons: ['One'], openOnRender: false, appendTo: container });

		// eslint-disable-next-line testing-library/no-node-access
		expect(container.querySelectorAll('.footer button').length).toBe(1);

		dialog.options.buttons = ['One', 'Two'];

		await findByText(container, 'Two');
		// eslint-disable-next-line testing-library/no-node-access
		expect(container.querySelectorAll('.footer button').length).toBe(2);
	});

	test('Button inside Component inside List inside Dialog fires onPointerDown', async () => {
		const handler = mock(() => {});

		class Item extends Component {
			build() {
				new Button({ textContent: '+', onPointerDown: handler, appendTo: this });
			}
		}

		new Dialog({
			openOnRender: false,
			body: new List({ items: [{}], ListItemComponent: Item }),
			appendTo: container,
		});

		const button = await findByText(container, '+');
		button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

		expect(handler).toHaveBeenCalled();
	});

	test('Button inside Component inside List inside Dialog fires onPointerPress', async () => {
		const handler = mock(() => {});

		class Item extends Component {
			build() {
				new Button({ textContent: '+', onPointerPress: handler, appendTo: this });
			}
		}

		new Dialog({
			openOnRender: false,
			body: new List({ items: [{}], ListItemComponent: Item }),
			appendTo: container,
		});

		const button = await findByText(container, '+');
		button.click();

		expect(handler).toHaveBeenCalled();
	});

	test('Button onPointerPress fires AFTER showModal()', async () => {
		const handler = mock(() => {});

		class Item extends Component {
			build() {
				new Button({ textContent: '+', onPointerPress: handler, appendTo: this });
			}
		}

		const dialog = new Dialog({
			openOnRender: false,
			body: new List({ items: [{}], ListItemComponent: Item }),
			appendTo: container,
		});

		dialog.open();

		const button = await findByText(container, '+');
		button.click();

		expect(handler).toHaveBeenCalled();
	});

	describe('closing', () => {
		const closed = () => new Promise(resolve => setTimeout(resolve, 10));

		test('a closed dialog is removed from the page', async () => {
			const dialog = new Dialog({ header: 'gone', openOnRender: false, appendTo: container });

			dialog.open();
			dialog.close();
			await closed();

			expect(container.contains(dialog.elem)).toBe(false);
		});

		test('removeOnClose: false keeps it to open again', async () => {
			const dialog = new Dialog({ header: 'kept', openOnRender: false, removeOnClose: false, appendTo: container });

			dialog.open();
			dialog.close();
			await closed();
			dialog.open();

			expect(container.contains(dialog.elem)).toBe(true);
			expect(dialog.elem.open).toBe(true);
		});

		test('a dialog opened again before it finished closing stays', async () => {
			const dialog = new Dialog({ header: 'back', openOnRender: false, appendTo: container });

			dialog.open();
			dialog.close();
			dialog.open();
			await closed();

			expect(container.contains(dialog.elem)).toBe(true);
		});
	});

	describe('confirm', () => {
		const answer = async (confirmation, label) => {
			await userEvent.setup().click(await findByText(document.body, label));

			return confirmation;
		};

		test('resolves true for the confirming button, which comes second', async () => {
			const confirmation = Dialog.confirm({ header: 'Delete it?', confirmLabel: 'Delete' });

			await findByText(document.body, 'Delete');

			expect(getAllByRole(document.body, 'button', { hidden: true }).map(button => button.textContent)).toEqual([
				'Cancel',
				'Delete',
			]);
			expect(await answer(confirmation, 'Delete')).toBe(true);
		});

		test('resolves false for the cancel button', async () => {
			const confirmation = Dialog.confirm({ header: 'Delete it?', confirmLabel: 'Delete', cancelLabel: 'Keep it' });

			expect(await answer(confirmation, 'Keep it')).toBe(false);
		});

		test('resolves false when closed any other way', async () => {
			const confirmation = Dialog.confirm({ header: 'Leave?', confirmLabel: 'Leave' });

			await findByText(document.body, 'Leave');
			await new Promise(resolve => setTimeout(resolve, 50));
			getByRole(document.body, 'dialog').close();

			expect(await confirmation).toBe(false);
		});
	});
});
