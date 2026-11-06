import { findByText } from '@testing-library/dom';

import { Content } from '.';

describe('Content', () => {
	test('holds what scrolls, with the padding asked for', async () => {
		const content = new Content({ padding: 12, textContent: 'rows', appendTo: container });

		await findByText(container, 'rows');
		expect(content.elem.style.padding).toBe('12px');
	});
});

describe('Content column and padding', () => {
	test('a column is centered at the default width, or the width given', () => {
		const content = new Content({ column: true, appendTo: container });

		expect(content.elem).toHaveClass('column');
		expect(content.elem.style.getPropertyValue('--content-column')).toBe('');

		content.options.column = 720;

		expect(content.elem.style.getPropertyValue('--content-column')).toBe('720px');

		content.options.column = false;

		expect(content.elem).not.toHaveClass('column');
		expect(content.elem.style.getPropertyValue('--content-column')).toBe('');
	});

	test('padding is written as given, and unset sets nothing', () => {
		const content = new Content({ padding: '0 12px', appendTo: container });

		expect(content.elem.style.padding).toBe('0px 12px');

		content.options.padding = null;

		expect(content.elem.style.padding).toBe('');
	});
});
