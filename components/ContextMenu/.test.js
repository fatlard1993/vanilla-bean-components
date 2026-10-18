import { findByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Button } from '../Button';
import { ContextMenu } from '.';

const settle = () => new Promise(resolve => setTimeout(resolve, 40));

describe('ContextMenu', () => {
	const open = async (options = {}) => {
		const opener = new Button({ textContent: 'More', appendTo: container });
		const menu = new ContextMenu({
			items: [
				{ textContent: 'Rename', onPointerPress: options.onRename ?? (() => {}) },
				{ textContent: 'Delete', onPointerPress: () => {} },
			],
			appendTo: container,
			...options,
		});

		opener.elem.focus();
		menu.show({ x: 20, y: 20 });
		await settle();

		return { menu, opener };
	};

	test('opens with its items, focus on the first', async () => {
		const { menu } = await open();

		expect(menu.shown).toBe(true);
		expect(await findByText(container, 'Rename')).toHaveFocus();
	});

	test('choosing an item runs it and closes the menu', async () => {
		const onRename = mock();
		const { menu, opener } = await open({ onRename });

		await userEvent.setup().click(await findByText(container, 'Rename'));

		expect(onRename).toHaveBeenCalledTimes(1);
		expect(menu.shown).toBe(false);
		expect(opener.elem).toHaveFocus();
	});

	test('a sticky menu stays open after a choice', async () => {
		const onRename = mock();
		const { menu } = await open({ onRename, sticky: true });

		await userEvent.setup().click(await findByText(container, 'Rename'));

		expect(onRename).toHaveBeenCalledTimes(1);
		expect(menu.shown).toBe(true);
	});

	test('Escape closes it and hands focus back', async () => {
		const { menu, opener } = await open();

		await userEvent.setup().keyboard('{Escape}');

		expect(menu.shown).toBe(false);
		expect(opener.elem).toHaveFocus();
	});

	test('a press outside closes it', async () => {
		const { menu, opener } = await open();

		await userEvent.setup().click(opener.elem);
		await settle();

		expect(menu.shown).toBe(false);
	});

	describe('under a button', () => {
		const anchored = async (items = [{ textContent: 'Rename', onPointerPress: () => {} }]) => {
			const button = new Button({ textContent: 'More', appendTo: container });
			const menu = new ContextMenu({ items, appendTo: container });

			button.onPointerPress(() => menu.show({ anchor: button }));
			button.elem.focus();
			await userEvent.setup().click(button.elem);
			await settle();

			return { button, menu };
		};

		test('opens under it, and marks it as having opened a menu', async () => {
			const { button, menu } = await anchored();

			expect(menu.shown).toBe(true);
			expect(button.elem).toHaveAttribute('aria-haspopup', 'menu');
			expect(button.elem).toHaveAttribute('aria-expanded', 'true');
			expect(menu.elem.style.top).toMatch(/px$/);
		});

		test('pressing the same button again closes it', async () => {
			const { button, menu } = await anchored();

			await userEvent.setup().click(button.elem);
			await settle();

			expect(menu.shown).toBe(false);
			expect(button.elem).toHaveAttribute('aria-expanded', 'false');
		});
	});

	test('a heading names a group and is passed over by the keys; a detail shows under its item', async () => {
		const { menu } = await open({
			items: [
				{ heading: 'Branches' },
				{ textContent: 'main', detail: 'up to date', onPointerPress: () => {} },
				{ textContent: 'dev', onPointerPress: () => {} },
			],
		});

		// The row with a detail holds two lines, so it's found by its whole text
		const mainRow = (_, elem) => elem.tagName === 'LI' && elem.textContent === ['main', 'up to date'].join('');

		expect(await findByText(container, 'Branches')).toHaveAttribute('role', 'presentation');
		expect(await findByText(container, 'up to date')).toHaveClass('detail');
		expect(await findByText(container, mainRow)).toHaveFocus();

		await userEvent.setup().keyboard('{ArrowDown}');
		expect(await findByText(container, 'dev')).toHaveFocus();

		await userEvent.setup().keyboard('{ArrowDown}');
		expect(await findByText(container, mainRow)).toHaveFocus();
		expect(menu.shown).toBe(true);
	});
});
