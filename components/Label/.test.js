import { findByText } from '@testing-library/dom';

import { Input } from '../Input';
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
		const label = new Label('Name', 'some text').appendTo(container);

		expect(label._labelText.elem.htmlFor).toBe('');
		expect(label.elem).toHaveTextContent(/^Name\s*some text$/);
	});
});

describe('Label text and field', () => {
	test('the text is a <label> for the field it holds, which is given an id to be found by', () => {
		const input = new Input();
		const label = new Label({ label: 'Name', appendTo: container }, input);

		expect(input.elem.id).toBe(input.uniqueId);
		expect(label._labelText.elem.htmlFor).toBe(input.elem.id);
		expect(label._labelText.elem.tagName).toBe('LABEL');
	});

	test("'for' takes an id, a component or an element", () => {
		const input = new Input({ appendTo: container });
		const label = new Label({ label: 'Name', for: 'field-1', appendTo: container });

		expect(label._labelText.elem.htmlFor).toBe('field-1');

		label.options.for = input;

		expect(label._labelText.elem.htmlFor).toBe(input.uniqueId);

		label.options.for = input.elem;

		expect(label._labelText.elem.htmlFor).toBe(input.uniqueId);
	});

	test('a string is the label text, and an object configures the text element', () => {
		const plain = new Label('Age').appendTo(container);
		const configured = new Label({ label: { textContent: 'Rich', addClass: 'big' }, appendTo: container });

		expect(plain._labelText.elem).toHaveTextContent('Age');
		expect(configured._labelText.elem).toHaveTextContent('Rich');
		expect(configured._labelText.elem).toHaveClass('big');

		plain.options.label = 'Years';

		expect(plain._labelText.elem).toHaveTextContent('Years');
	});
});

describe('Label tooltip', () => {
	test("the tooltip describes the field the label is for, alongside the field's own description", async () => {
		const input = new Input({ 'aria-describedby': 'own-hint' });
		const hint = Object.assign(document.createElement('span'), { id: 'own-hint', textContent: 'Required.' });
		container.append(hint);
		const label = new Label({ label: 'Name', tooltip: 'As on your passport', appendTo: container }, input);

		await Promise.resolve();

		expect(input.elem).toHaveAccessibleDescription('Required. As on your passport');

		label.options.tooltip = null;

		expect(input.elem).toHaveAccessibleDescription('Required.');
	});

	test('the tooltip moves with for, and reaches a field given by id', async () => {
		const first = new Input({ appendTo: container });
		const second = new Input({ id: 'second-field', appendTo: container });
		const label = new Label({ label: 'Name', for: first, tooltip: 'Help', appendTo: container });

		await Promise.resolve();

		expect(first.elem).toHaveAccessibleDescription('Help');

		label.options.for = 'second-field';

		expect(first.elem).not.toHaveAttribute('aria-describedby');
		expect(second.elem).toHaveAccessibleDescription('Help');
	});
});

describe('Label variants', () => {
	test('each variant marks the element, and only one at a time', () => {
		const label = new Label({ label: 'L', variant: 'inline', appendTo: container });

		expect(label.elem).toHaveClass('variant-inline');

		label.options.variant = 'overlay';

		expect(label.elem).toHaveClass('variant-overlay');
		expect(label.elem).not.toHaveClass('variant-inline');
		expect(() => (label.options.variant = 'sideways')).toThrow('not a valid variant');
	});

	test('inline-after marks the text to be drawn after the field, and another variant puts it back before', () => {
		const input = new Input();
		const label = new Label({ label: 'L', variant: 'inline-after', appendTo: container }, input);

		// The stylesheet orders the text after the field by its class, however the children were appended
		expect(label.elem).toHaveClass('variant-inline-after');
		expect(label._labelText.elem).toHaveClass('label-text');

		label.options.variant = 'inline';

		// eslint-disable-next-line testing-library/no-node-access
		expect(label.elem.firstElementChild).toBe(label._labelText.elem);
	});

	test('a collapsible label starts collapsed when told to, and a click opens and closes it', () => {
		const label = new Label({ label: 'More', variant: 'collapsible', collapsed: true, appendTo: container });
		const text = label._labelText.elem;

		expect(label.elem).toHaveClass('collapsed');
		expect(text.getAttribute('aria-expanded')).toBe('false');

		text.click();

		expect(label.elem).not.toHaveClass('collapsed');
		expect(text.getAttribute('aria-expanded')).toBe('true');
	});

	test('a label that is not collapsible ignores clicks on its text', () => {
		const label = new Label({ label: 'Plain', appendTo: container });

		label._labelText.elem.click();

		expect(label.elem).not.toHaveClass('collapsed');
		expect(label._labelText.elem.hasAttribute('aria-expanded')).toBe(false);
		expect(label._labelText.elem.hasAttribute('tabindex')).toBe(false);
	});
});
