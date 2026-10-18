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

	test('a click on an item, or on something inside one, selects; a heading row does not', () => {
		const select = mock();
		const menu = new Menu({ items: [{ textContent: 'Rename' }], appendTo: container });
		const [item] = getAllByRole(container, 'listitem');
		const inner = new Elem({ tag: 'li', textContent: 'nested', appendTo: new Elem({ tag: 'ul', appendTo: item }) });
		const heading = new Elem({ tag: 'li', textContent: 'Files', attributes: { role: 'presentation' }, appendTo: menu });

		menu.on({ targetEvent: 'select', callback: select });

		inner.elem.click();
		heading.elem.click();

		expect(select).toHaveBeenCalledTimes(1);
	});
});
