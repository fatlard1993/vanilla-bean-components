import { findByText } from '@testing-library/dom';

import { TagList } from '.';

describe('TagList', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new TagList({ tags: [textContent], appendTo: container });

		await findByText(container, textContent);
	});
});
