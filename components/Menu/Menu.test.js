import { Menu } from '.';

describe('Menu', () => {
	let menu;
	let warnings;
	const originalWarn = console.warn;

	beforeEach(() => {
		warnings = [];
		console.warn = (...args) => warnings.push(args.join(' '));
	});

	afterEach(() => {
		console.warn = originalWarn;
		menu?.destroy?.();
		menu = null;
		document.body.replaceChildren();
	});

	describe('select event', () => {
		test('onSelect registers without warnings and fires on pointer activation', () => {
			const received = [];
			menu = new Menu({ items: ['one', 'two'], onSelect: event => received.push(event), appendTo: document.body });

			expect(warnings.filter(warning => warning.includes('onSelect'))).toEqual([]);

			const li = menu.elem.querySelector('li');
			li.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			li.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

			expect(received.length).toBe(1);
			expect(received[0].type).toBe('select');
			expect(received[0].detail.target).toBe(li);
		});

		test('keyboard Enter fires select with the keydown event in detail', () => {
			const received = [];
			menu = new Menu({ items: ['one', 'two'], onSelect: event => received.push(event), appendTo: document.body });

			const li = menu.elem.querySelector('li');
			li.focus();
			menu.elem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

			expect(received.length).toBe(1);
			expect(received[0].detail.key).toBe('Enter');
		});
	});
});
