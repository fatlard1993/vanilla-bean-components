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
