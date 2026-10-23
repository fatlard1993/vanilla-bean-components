import { findAllByRole, getAllByRole } from '@testing-library/dom';

import { Elem } from '../../Elem';

import { Menu } from '.';

describe('Menu', () => {
	test('must render items', async () => {
		const items = [{ textContent: 'item1' }, { textContent: 'item2' }];

		new Menu({ items, appendTo: container });

		const listItems = await findAllByRole(container, 'listitem');

		listItems.forEach((item, index) => expect(item.textContent).toBe(items[index].textContent));
	});

	test('a click on an item, or on something inside one, presses it; a heading row does not', () => {
		const press = mock();
		const menu = new Menu({ items: [{ textContent: 'Rename' }], appendTo: container });
		const [item] = getAllByRole(container, 'listitem');
		const inner = new Elem({ tag: 'li', textContent: 'nested', appendTo: new Elem({ tag: 'ul', appendTo: item }) });
		const heading = new Elem({ tag: 'li', textContent: 'Files', attributes: { role: 'presentation' }, appendTo: menu });

		menu.on({ targetEvent: 'itemPress', callback: press });

		inner.elem.click();
		heading.elem.click();

		expect(press).toHaveBeenCalledTimes(1);
		expect(press.mock.calls[0][0].detail.item).toBe(item);
	});
});

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

	describe('itemPress event', () => {
		test('onItemPress registers without warnings and fires on a click', () => {
			const received = [];
			menu = new Menu({ items: ['one', 'two'], onItemPress: event => received.push(event), appendTo: document.body });

			expect(warnings.filter(warning => warning.includes('onItemPress'))).toEqual([]);

			const [li] = getAllByRole(menu.elem, 'listitem');
			li.click();

			expect(received.length).toBe(1);
			expect(received[0].type).toBe('itemPress');
			expect(received[0].detail.item).toBe(li);
			expect(received[0].detail.event.type).toBe('click');
		});

		test('Enter and Space press the focused item: its own handler runs, and itemPress comes from that click', () => {
			const received = [];
			const pressed = [];
			menu = new Menu({
				items: [{ textContent: 'one', onPointerPress: () => pressed.push('one') }, 'two'],
				onItemPress: event => received.push(event),
				appendTo: document.body,
			});

			const [li] = getAllByRole(menu.elem, 'listitem');
			li.focus();
			menu.elem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
			menu.elem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

			expect(pressed).toEqual(['one', 'one']);
			expect(received.map(event => event.detail.event.type)).toEqual(['click', 'click']);
			expect(received[0].detail.item).toBe(li);
		});
	});
});
