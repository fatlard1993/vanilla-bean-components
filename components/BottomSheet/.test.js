import { describe, test, expect } from 'bun:test';
import { Button, Component } from '../..';
import { BottomSheet } from '.';

describe('BottomSheet', () => {
	describe('rendering', () => {
		test('a dialog, mounted to document.body by default', () => {
			const sheet = new BottomSheet();

			expect(container.contains(sheet.elem)).toBe(true);
			expect(sheet.elem.tagName).toBe('DIALOG');
		});

		test('renders drag handle', () => {
			const sheet = new BottomSheet();

			expect(sheet.elem.querySelector('.sheet-handle')).not.toBeNull();
		});

		test('body getter returns content container', () => {
			const sheet = new BottomSheet();

			expect(sheet.body).toBeDefined();
			expect(sheet.body.elem).toBeInstanceOf(HTMLElement);
		});

		test('appended children land in the sheet body', () => {
			const child = new Component({ tag: 'p', textContent: 'content' });
			const sheet = new BottomSheet({ append: child });

			expect(sheet.body.elem.contains(child.elem)).toBe(true);
		});
	});

	describe('open / close', () => {
		test('starts closed, opens as a modal, and closes', () => {
			const sheet = new BottomSheet();
			const showModal = spyOn(sheet.elem, 'showModal');

			expect(sheet.isOpen).toBe(false);

			sheet.open();

			expect(showModal).toHaveBeenCalledTimes(1);
			expect(sheet.isOpen).toBe(true);

			sheet.close();

			expect(sheet.isOpen).toBe(false);
		});

		test('a number for autoOpen is its delay', async () => {
			const sheet = new BottomSheet({ autoOpen: 10 });

			expect(sheet.isOpen).toBe(false);

			await new Promise(resolve => setTimeout(resolve, 40));

			expect(sheet.isOpen).toBe(true);
		});

		test('focus moves into it on opening and back on closing', () => {
			const opener = new Button({ textContent: 'Open', appendTo: container });
			const sheet = new BottomSheet({ append: new Button({ textContent: 'Inside' }) });

			opener.elem.focus();
			sheet.open();

			expect(document.activeElement.textContent).toBe('Inside');

			sheet.close();

			expect(document.activeElement).toBe(opener.elem);
		});

		test('navigating away closes it', () => {
			const sheet = new BottomSheet();

			sheet.open();
			window.dispatchEvent(new HashChangeEvent('hashchange'));

			expect(sheet.isOpen).toBe(false);
		});
	});

	describe('the close event', () => {
		test('onClose hears an open sheet close', () => {
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });

			sheet.open();
			sheet.close();

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		test('closing a sheet that is already closed announces nothing', () => {
			// close announces a dismissal. A sheet that was never opened has nothing to dismiss, so a caller closing
			// defensively, or wiring close() to several dismissal paths, should not hear a close it did not cause.
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });

			sheet.close();
			sheet.close();

			expect(onClose).not.toHaveBeenCalled();
		});

		test('it is announced each time', () => {
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });

			sheet.open();
			sheet.close();
			sheet.open();
			sheet.close();

			expect(onClose).toHaveBeenCalledTimes(2);
		});

		test('a press on the dimmed page, outside the sheet, closes it', () => {
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });

			sheet.open();
			Object.defineProperty(sheet.elem, 'getBoundingClientRect', {
				value: () => ({ left: 0, right: 400, top: 300, bottom: 600 }),
				configurable: true,
			});

			sheet.elem.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 200, clientY: 400 }));

			expect(onClose).not.toHaveBeenCalled();

			sheet.elem.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 200, clientY: 100 }));

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('drag-to-close', () => {
		const drag = (sheet, from, to, end = 'pointerup') => {
			const zone = sheet._dragZone.elem;

			zone.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientY: from }));
			zone.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientY: to }));
			zone.dispatchEvent(new PointerEvent(end, { bubbles: true, clientY: to }));
		};

		const openSheet = onClose => {
			const sheet = new BottomSheet({ onClose });

			sheet.open();
			Object.defineProperty(sheet.elem, 'offsetHeight', { value: 400, configurable: true });

			return sheet;
		};

		test('a drag past the threshold closes it', () => {
			const onClose = mock();
			const sheet = openSheet(onClose);

			drag(sheet, 10, 200);

			expect(onClose).toHaveBeenCalledTimes(1);
			expect(sheet.elem.style.transform).toBe('');
		});

		test('the sheet follows the pointer down while it drags', () => {
			const sheet = openSheet();
			const zone = sheet._dragZone.elem;

			zone.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientY: 10 }));
			zone.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientY: 60 }));

			expect(sheet.elem.style.transform).toBe('translateY(50px)');
		});

		test('a drag short of the threshold does not close it', () => {
			const onClose = mock();
			const sheet = openSheet(onClose);

			drag(sheet, 10, 30);

			expect(onClose).not.toHaveBeenCalled();
			expect(sheet.isOpen).toBe(true);
		});

		test('a drag the browser takes back puts it back without closing', () => {
			const onClose = mock();
			const sheet = openSheet(onClose);

			drag(sheet, 10, 300, 'pointercancel');

			expect(onClose).not.toHaveBeenCalled();
			expect(sheet.elem.style.transform).toBe('');
			expect(sheet.isOpen).toBe(true);
		});
	});

	describe('cleanup', () => {
		test('destroy removes element from DOM', () => {
			const sheet = new BottomSheet();

			expect(container.contains(sheet.elem)).toBe(true);
			sheet.destroy();
			expect(container.contains(sheet.elem)).toBe(false);
		});
	});
});
