import { findByText } from '@testing-library/dom';

import { Component } from '../..';

import { Popover } from '.';

describe('Popover', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Popover({ appendTo: container, append: new Component({ textContent }) });

		await findByText(container, textContent);
	});

	describe('outsideClose', () => {
		const settle = () => new Promise(resolve => setTimeout(resolve, 40));
		const shown = popover => popover.elem.style.display === 'block';
		// The whole of a real press, not just its click
		const press = ({ elem }) => {
			elem.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			elem.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
			elem.click();
		};

		const setup = async () => {
			const popover = new Popover({ outsideClose: true, autoOpen: false, appendTo: container });
			const elsewhere = new Component({ tag: 'button', textContent: 'elsewhere', appendTo: container });

			popover.show();
			await settle();

			return { popover, elsewhere };
		};

		test('a press elsewhere hides it', async () => {
			const { popover, elsewhere } = await setup();

			press(elsewhere);
			await settle();

			expect(shown(popover)).toBe(false);
		});

		test('a press inside keeps it', async () => {
			const { popover } = await setup();
			const inside = new Component({ tag: 'button', appendTo: popover });

			press(inside);
			await settle();

			expect(shown(popover)).toBe(true);
		});

		test('a toggle outside it closes it, rather than closing and opening again', async () => {
			const { popover } = await setup();
			const toggle = new Component({
				tag: 'button',
				appendTo: container,
				onPointerPress: () => (shown(popover) ? popover.hide() : popover.show()),
			});

			press(toggle);
			await settle();

			expect(shown(popover)).toBe(false);
		});

		test('a press that shows it somewhere new keeps it', async () => {
			const { popover } = await setup();
			const showElsewhere = new Component({
				tag: 'button',
				appendTo: container,
				onPointerPress: () => popover.show({ x: 20, y: 20 }),
			});

			press(showElsewhere);
			await settle();

			expect(shown(popover)).toBe(true);
		});
	});
});
