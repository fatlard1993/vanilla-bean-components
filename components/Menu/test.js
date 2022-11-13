import { findAllByRole } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Menu from '.';

const container = new JSDOM().window.document.body;

describe('Menu', () => {
	test('must render items', async () => {
		const items = [{ textContent: 'item1' }, { textContent: 'item2' }];

		new Menu({ items, appendTo: container });

		await (
			await findAllByRole(container, 'listitem')
		).forEach((item, index) => expect(item.textContent, items[index].textContent));
	});
});
