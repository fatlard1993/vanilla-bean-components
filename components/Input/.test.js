import { findByDisplayValue, fireEvent } from '@testing-library/dom';

import { Input } from '.';

describe('Input', () => {
	test('must render', async () => {
		const value = 'textValue';

		new Input({ value, appendTo: container });

		await findByDisplayValue(container, value);
	});

	test('must provide dirty state tracking', async () => {
		const value = 'textValue';

		const input = new Input({ value, appendTo: container });

		await findByDisplayValue(container, value);

		expect(input.isDirty).toBe(false);

		input.options.value = 'tempValue';

		expect(input.isDirty).toBe(true);

		input.options.value = value;

		expect(input.isDirty).toBe(false);
	});

	test('infers input type from value data type', () => {
		const textInput = new Input({ value: 'text', appendTo: container });
		expect(textInput.elem.type).toBe('text');

		const numberInput = new Input({ value: 42, appendTo: container });
		expect(numberInput.elem.type).toBe('number');

		const booleanInput = new Input({ value: true, appendTo: container });
		expect(booleanInput.elem.type).toBe('checkbox');
	});

	test('handles textarea tag with syntax highlighting', () => {
		const textarea = new Input({
			tag: 'textarea',
			value: 'const x = 1;',
			syntaxHighlighting: true,
			language: 'javascript',
			appendTo: container,
		});

		expect(textarea.elem.tagName).toBe('TEXTAREA');
		expect(textarea.elem.className).toContain('syntaxHighlighting');
		expect(textarea.elem.className).toContain('language-javascript');
	});

	test('handles auto height for textarea', () => {
		const textarea = new Input({
			tag: 'textarea',
			value: 'Line 1\nLine 2\nLine 3',
			height: 'auto',
			appendTo: container,
		});

		expect(textarea.elem.style.height).toContain('calc');
		expect(textarea.__updateAutoHeight).toBeDefined();
	});

	test('handles checkbox type correctly', () => {
		const checkbox = new Input({
			type: 'checkbox',
			value: true,
			appendTo: container,
		});

		expect(checkbox.elem.type).toBe('checkbox');
		expect(checkbox.elem.checked).toBe(true);

		checkbox.options.value = false;
		expect(checkbox.elem.checked).toBe(false);
	});

	test('validates input with validation rules', () => {
		const input = new Input({
			value: '',
			validations: [
				[/.+/, 'Required field'],
				[/^.{3,}$/, 'Minimum 3 characters'],
			],
			appendTo: container,
		});

		const errors = input.validate();
		expect(errors).toHaveLength(2);
		expect(input.elem.className).toContain('validationErrors');

		input.options.value = 'wow';
		const noErrors = input.validate();
		expect(noErrors).toBe(undefined); // Returns undefined when no errors
		expect(input.elem.className).not.toContain('validationErrors');
	});

	test('handles change events', async () => {
		const onChange = mock(() => {});
		new Input({
			value: 'initial',
			onChange,
			appendTo: container,
		});

		const element = await findByDisplayValue(container, 'initial');

		fireEvent.change(element, { target: { value: 'changed' } });

		expect(onChange).toHaveBeenCalled();
		expect(onChange.mock.calls[0][0].value).toBe('changed');
	});

	test('sets default input options', () => {
		const input = new Input({ appendTo: container });

		expect(input.elem.tagName).toBe('INPUT');
		expect(input.elem.value).toBe('');
		expect(input.elem.autocomplete).toBe('off');
		expect(input.elem.autocapitalize).toBe('off');
		expect(input.elem.autocorrect).toBe('off');
		expect(input.elem.placeholder).toBe('');
	});

	test('supports all input types from enum', () => {
		const input = new Input({ type: 'email', appendTo: container });
		expect(input.type_enum).toContain('email');
		expect(input.elem.type).toBe('email');
	});

	test('handles tab key in syntax highlighted textarea', async () => {
		const textarea = new Input({
			tag: 'textarea',
			syntaxHighlighting: true,
			value: 'line1\nline2',
			appendTo: container,
		});

		const element = textarea.elem;
		element.selectionStart = 0;
		element.selectionEnd = 0;

		const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
		const preventDefaultSpy = spyOn(tabEvent, 'preventDefault');

		fireEvent(element, tabEvent);

		expect(preventDefaultSpy).toHaveBeenCalled();
	});
});
