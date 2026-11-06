import { findByRole } from '@testing-library/dom';

import { SectionLabel } from '.';

describe('SectionLabel', () => {
	test('is a heading at the level asked for', async () => {
		new SectionLabel({ textContent: 'Recent', appendTo: container });
		new SectionLabel({ textContent: 'Older', level: 4, appendTo: container });

		expect(await findByRole(container, 'heading', { name: 'Recent', level: 3 })).toBeDefined();
		expect(await findByRole(container, 'heading', { name: 'Older', level: 4 })).toBeDefined();
	});
});

describe('SectionLabel level and attributes', () => {
	test("the level follows its option, and attributes of the app's own sit beside the role", async () => {
		const label = new SectionLabel({ textContent: 'Recent', attributes: { 'data-group': 'a' }, appendTo: container });

		label.options.level = 2;

		expect(await findByRole(container, 'heading', { name: 'Recent', level: 2 })).toBeDefined();
		expect(label.elem.getAttribute('data-group')).toBe('a');
	});
});
