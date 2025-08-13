import { findAllByRole, findByRole, findByText } from '@testing-library/dom';

import { Component } from '../..';
import { List } from '.';

describe('List', () => {
	test('must render items', async () => {
		const items = [{ textContent: 'item1' }, { textContent: 'item2' }];

		new List({ items, appendTo: container });

		const listItems = await findAllByRole(container, 'listitem');

		listItems.forEach((item, index) => expect(item.textContent).toBe(items[index].textContent));
	});

	test('renders as ul element by default', async () => {
		const list = new List({ appendTo: container });

		expect(list.elem.tagName).toBe('UL');
		await findByRole(container, 'list');
	});

	test('handles string items', async () => {
		const items = ['Item 1', 'Item 2', 'Item 3'];

		new List({ items, appendTo: container });

		for (const item of items) {
			await findByText(container, item);
		}

		const listItems = await findAllByRole(container, 'listitem');
		expect(listItems).toHaveLength(3);
	});

	test('handles component items', async () => {
		const items = [new Component({ textContent: 'Component 1' }), new Component({ textContent: 'Component 2' })];

		new List({ items, appendTo: container });

		await findByText(container, 'Component 1');
		await findByText(container, 'Component 2');
	});

	test('handles mixed object and string items', async () => {
		const items = ['Simple string', { textContent: 'Object item' }, { content: 'Content item' }];

		new List({ items, appendTo: container });

		await findByText(container, 'Simple string');
		await findByText(container, 'Object item');
		await findByText(container, 'Content item');
	});

	test('supports custom ListItemComponent', async () => {
		class CustomListItem extends Component {
			constructor(options = {}) {
				super({
					...options,
					className: 'custom-list-item',
					textContent: options.content,
				});
			}
		}

		const items = ['Item 1', 'Item 2'];

		new List({
			items,
			ListItemComponent: CustomListItem,
			appendTo: container,
		});

		await findByText(container, 'Item 1');
		await findByText(container, 'Item 2');

		await findAllByRole(container, 'listitem');
		// eslint-disable-next-line testing-library/no-node-access
		const customItem = container.querySelector('.custom-list-item');
		expect(customItem).toBeTruthy();
	});

	test('supports item-specific ListItemComponent', async () => {
		class SpecialItem extends Component {
			constructor(options = {}) {
				super({
					...options,
					className: 'special-item',
					textContent: `Special: ${options.textContent}`,
				});
			}
		}

		const items = [
			'Normal item',
			{
				textContent: 'Special item',
				ListItemComponent: SpecialItem,
			},
		];

		new List({ items, appendTo: container });

		await findByText(container, 'Normal item');
		await findByText(container, 'Special: Special item');
	});

	test('supports listItemOptions', async () => {
		const items = [
			{
				textContent: 'Tooltip Item',
				listItemOptions: {
					tooltip: 'This is a tooltip',
					className: 'has-tooltip',
				},
			},
		];

		new List({ items, appendTo: container });

		const listItems = await findAllByRole(container, 'listitem');
		expect(listItems[0].className).toContain('has-tooltip');
	});

	test('empties list when items is null or undefined', async () => {
		const list = new List({
			items: ['Item 1', 'Item 2'],
			appendTo: container,
		});

		const listItems = await findAllByRole(container, 'listitem');
		expect(listItems).toHaveLength(2);

		list.options.items = null;

		// After emptying, there should be no list items
		// eslint-disable-next-line testing-library/no-node-access
		const remainingItems = container.querySelectorAll('li');
		expect(remainingItems).toHaveLength(0);
	});

	test('applies styling classes correctly', () => {
		const list = new List({ appendTo: container });

		// Should have styled component classes
		expect(list.elem.className).toBeTruthy();
	});

	test('supports noStyle class', () => {
		const list = new List({
			addClass: 'noStyle',
			appendTo: container,
		});

		expect(list.elem.className).toContain('noStyle');
	});

	test('handles array items', async () => {
		const items = [['Array item 1', 'Array item 2'], 'String item'];

		new List({ items, appendTo: container });

		const listItems = await findAllByRole(container, 'listitem');
		expect(listItems).toHaveLength(2);
	});
});
