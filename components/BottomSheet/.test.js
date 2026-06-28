import { describe, test, expect } from 'bun:test';
import { Component } from '../..';
import { BottomSheet } from '.';

describe('BottomSheet', () => {
	describe('rendering', () => {
		test('mounts to document.body by default', () => {
			const sheet = new BottomSheet();

			expect(container.contains(sheet.elem)).toBe(true);
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

			expect(sheet.elem.contains(child.elem)).toBe(true);
		});
	});

	describe('show / hide', () => {
		test('show() adds open class', () => {
			const sheet = new BottomSheet();
			sheet.show();

			expect(sheet.elem.classList.contains('open')).toBe(true);
		});

		test('hide() removes open class', () => {
			const sheet = new BottomSheet();
			sheet.show();
			sheet.hide();

			expect(sheet.elem.classList.contains('open')).toBe(false);
		});

		test('starts hidden', () => {
			const sheet = new BottomSheet();

			expect(sheet.elem.classList.contains('open')).toBe(false);
		});
	});

	describe('onClose', () => {
		test('onClose fires when hide() is called', () => {
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });

			sheet.hide();

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		test('onClose does not fire when show() is called', () => {
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });

			sheet.show();

			expect(onClose).not.toHaveBeenCalled();
		});

		test('onClose fires each time hide() is called', () => {
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });

			sheet.show();
			sheet.hide();
			sheet.show();
			sheet.hide();

			expect(onClose).toHaveBeenCalledTimes(2);
		});

		test('onClose is optional', () => {
			const sheet = new BottomSheet();

			expect(() => sheet.hide()).not.toThrow();
		});
	});

	describe('drag-to-close', () => {
		const fireTouch = (el, type, clientY, opts = {}) => {
			const touch = { clientY, identifier: 0, target: el };
			const event = new TouchEvent(type, {
				touches: type === 'touchend' || type === 'touchcancel' ? [] : [touch],
				changedTouches: [touch],
				cancelable: true,
				bubbles: true,
				...opts,
			});
			el.dispatchEvent(event);
			return event;
		};

		test('drag past threshold calls hide()', () => {
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });
			sheet.show();

			Object.defineProperty(sheet.elem, 'offsetHeight', { value: 400, configurable: true });
			Object.defineProperty(sheet.elem, 'getBoundingClientRect', { value: () => ({ top: 0 }), configurable: true });

			fireTouch(sheet._dragZone.elem, 'touchstart', 10);
			fireTouch(sheet._dragZone.elem, 'touchend', 200);

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		test('drag below threshold does not hide', () => {
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });
			sheet.show();

			Object.defineProperty(sheet.elem, 'offsetHeight', { value: 400, configurable: true });
			Object.defineProperty(sheet.elem, 'getBoundingClientRect', { value: () => ({ top: 0 }), configurable: true });

			fireTouch(sheet.elem, 'touchstart', 10);
			fireTouch(sheet.elem, 'touchend', 30);

			expect(onClose).not.toHaveBeenCalled();
			expect(sheet.elem.classList.contains('open')).toBe(true);
		});

		test('touchcancel resets transform without hiding', () => {
			const onClose = mock();
			const sheet = new BottomSheet({ onClose });
			sheet.show();

			Object.defineProperty(sheet.elem, 'getBoundingClientRect', { value: () => ({ top: 0 }), configurable: true });

			fireTouch(sheet.elem, 'touchstart', 10);
			fireTouch(sheet.elem, 'touchcancel', 10);

			expect(onClose).not.toHaveBeenCalled();
			expect(sheet.elem.style.transform).toBe('');
			expect(sheet.elem.classList.contains('open')).toBe(true);
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
