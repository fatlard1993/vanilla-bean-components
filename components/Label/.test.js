import { findByText } from '@testing-library/dom';

import { Label } from '.';

describe('Label', () => {
	test('must render', async () => {
		const label = 'label';

		new Label({ label, appendTo: container });

		await findByText(container, label);
	});
});

describe('Label as a control', () => {
	test('a collapsible label is reached by Tab and opened and closed by Enter', () => {
		const label = new Label({ label: 'More', variant: 'collapsible', appendTo: container });
		const text = label._labelText.elem;

		expect(text.tabIndex).toBe(0);
		expect(text.getAttribute('role')).toBe('button');

		text.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		expect(label.elem).toHaveClass('collapsed');
		expect(text.getAttribute('aria-expanded')).toBe('false');
	});

	test('a text child is content, not the field the label is for', () => {
		const label = new Label('Name', 'some text', { appendTo: container });

		expect(label._labelText.elem.htmlFor).toBe('');
	});
});
