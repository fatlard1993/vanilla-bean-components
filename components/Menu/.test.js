import { findAllByRole } from '@testing-library/dom';

import { Menu } from '.';

describe('Menu', () => {
	test('must render items', async () => {
		const items = [{ textContent: 'item1' }, { textContent: 'item2' }];

		new Menu({ items, appendTo: container });

		const listItems = await findAllByRole(container, 'listitem');

		listItems.forEach((item, index) => expect(item.textContent, items[index].textContent));
	});
});
