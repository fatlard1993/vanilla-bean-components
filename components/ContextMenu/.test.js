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
});
