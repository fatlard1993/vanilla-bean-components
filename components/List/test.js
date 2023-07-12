import { findAllByRole } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { List } from '.';

const container = new JSDOM().window.document.body;

describe('List', () => {
	test('must render items', async () => {
		const items = [{ textContent: 'item1' }, { textContent: 'item2' }];

		new List({ items, appendTo: container });

		const listItems = await findAllByRole(container, 'listitem');

		listItems.forEach((item, index) => expect(item.textContent, items[index].textContent));
	});
});
