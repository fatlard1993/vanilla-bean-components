import { findByText } from '@testing-library/dom';

import { Content } from '.';

describe('Content', () => {
	test('holds what scrolls, with the padding asked for', async () => {
		const content = new Content({ padding: 12, textContent: 'rows', appendTo: container });

		await findByText(container, 'rows');
		expect(content.elem.style.padding).toBe('12px');
	});
});
