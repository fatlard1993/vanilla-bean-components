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
		expect(textarea.elem.className).toContain('syntax-highlighting');
		expect(textarea.elem.className).toContain('language-javascript');
	});

	test('handles auto height for textarea', () => {
		const textarea = new Input({
			tag: 'textarea',
			value: 'Line 1\nLine 2\nLine 3',
			height: 'auto',
			appendTo: container,
		});

		// The browser sizes it to its content, wrapped lines included; without field-sizing the height is measured
		expect(textarea.elem.style.fieldSizing).toBe('content');
		expect(textarea.__updateAutoHeight).toBeDefined();
	});

	test('a syntax-highlighting textarea keeps the line-counted height its overlay is aligned to', () => {
		const textarea = new Input({
			tag: 'textarea',
			value: 'a\nb',
			syntaxHighlighting: true,
			appendTo: container,
		});

		expect(textarea.elem.style.height).toBe('calc(2.38em + 10px)');
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
		expect(input.elem.className).toContain('validation-errors');

		input.options.value = 'wow';
		const noErrors = input.validate();
		expect(noErrors).toBe(undefined); // Returns undefined when no errors
		expect(input.elem.className).not.toContain('validation-errors');
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
		expect(input.optionEnum('type')).toContain('email');
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

	test('suggestions become a datalist the field lists, kept in step', () => {
		const input = new Input({ suggestions: ['Hail', 'Flood'], appendTo: container });
		// A datalist isn't rendered, so there's no role to find its options by
		// eslint-disable-next-line testing-library/no-node-access
		const list = () => [...document.getElementById(input.elem.getAttribute('list')).options];

		expect(list().map(option => option.value)).toEqual(['Hail', 'Flood']);

		input.options.suggestions = ['Wind'];
		expect(list().map(option => option.value)).toEqual(['Wind']);

		input.options.suggestions = [];
		expect(input.elem.hasAttribute('list')).toBe(false);
	});

	describe('files', () => {
		const file = (name, type) => new File(['x'], name, { type });
		// happy-dom's DataTransfer takes no files, so a drop carries a plain stand-in
		const fileEvent = (type, files, property = 'dataTransfer') =>
			Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
				[property]: { types: ['Files'], files },
			});

		test('a picked file reaches onFiles, and the field clears so the same file can be picked again', () => {
			const onFiles = mock();
			const input = new Input({ type: 'file', onFiles, appendTo: container });
			const picked = file('map.csv', 'text/csv');

			Object.defineProperty(input.elem, 'files', { configurable: true, value: [picked] });
			input.elem.dispatchEvent(new Event('change', { bubbles: true }));

			expect(onFiles.mock.calls[0][0]).toEqual([picked]);
			expect(input.elem.value).toBe('');
		});

		test('a drop zone takes dropped and pasted files that accept allows, marking itself while dragged over', () => {
			const onFiles = mock();
			const zone = document.createElement('div');

			container.append(zone);
			new Input({ type: 'file', accept: '.csv', onFiles, dropZone: zone, appendTo: container });

			zone.dispatchEvent(fileEvent('dragover', []));
			expect(zone.classList.contains('drag-over')).toBe(true);

			const drop = fileEvent('drop', [file('map.csv', 'text/csv'), file('photo.png', 'image/png')]);

			zone.dispatchEvent(drop);
			expect(zone.classList.contains('drag-over')).toBe(false);
			expect(drop.defaultPrevented).toBe(true);
			expect(onFiles.mock.calls[0][0].map(({ name }) => name)).toEqual(['map.csv']);

			zone.dispatchEvent(fileEvent('paste', [file('other.csv', 'text/csv')], 'clipboardData'));
			expect(onFiles.mock.calls[1][0].map(({ name }) => name)).toEqual(['other.csv']);

			zone.dispatchEvent(fileEvent('paste', [file('photo.png', 'image/png')], 'clipboardData'));
			expect(onFiles).toHaveBeenCalledTimes(2);
		});

		test('pressing the drop zone opens the picker', () => {
			const zone = document.createElement('div');

			container.append(zone);

			const input = new Input({ type: 'file', dropZone: zone, appendTo: container });
			const opened = mock();

			input.elem.click = opened;
			zone.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			zone.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

			expect(opened).toHaveBeenCalledTimes(2);
			expect(zone.getAttribute('tabindex')).toBe('0');
		});

		test("onFiles isn't wired as a listener for an event named files", () => {
			const onFiles = mock();
			const input = new Input({ type: 'file', onFiles, appendTo: container });

			input.elem.dispatchEvent(new Event('files'));

			expect(onFiles).not.toHaveBeenCalled();
		});
	});
});
