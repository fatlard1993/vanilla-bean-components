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
		test('onSelect registers without warnings and fires on a click', () => {
			const received = [];
			menu = new Menu({ items: ['one', 'two'], onSelect: event => received.push(event), appendTo: document.body });

			expect(warnings.filter(warning => warning.includes('onSelect'))).toEqual([]);

			const li = menu.elem.querySelector('li');
			li.click();

			expect(received.length).toBe(1);
			expect(received[0].type).toBe('select');
			expect(received[0].detail.target).toBe(li);
		});

		test('Enter and Space press the focused item: its own handler runs, and select comes from that click', () => {
			const received = [];
			const pressed = [];
			menu = new Menu({
				items: [{ textContent: 'one', onPointerPress: () => pressed.push('one') }, 'two'],
				onSelect: event => received.push(event),
				appendTo: document.body,
			});

			const li = menu.elem.querySelector('li');
			li.focus();
			menu.elem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
			menu.elem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

			expect(pressed).toEqual(['one', 'one']);
			expect(received.map(event => event.detail.type)).toEqual(['click', 'click']);
			expect(received[0].detail.target).toBe(li);
		});
	});
});
