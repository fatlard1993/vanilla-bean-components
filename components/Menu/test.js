import { findAllByRole } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { Menu } from '.';

const container = new JSDOM().window.document.body;

describe('Menu', () => {
	test('must render items', async () => {
		const items = [{ textContent: 'item1' }, { textContent: 'item2' }];

		new Menu({ items, appendTo: container });

		const listItems = await findAllByRole(container, 'listitem');

		listItems.forEach((item, index) => expect(item.textContent, items[index].textContent));
	});
});
