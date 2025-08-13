import { getByRole, getAllByRole } from '@testing-library/dom';

import { Select } from '.';

describe('Select', () => {
	test('must render', async () => {
		new Select({
			options: ['one', '2', { label: 'Three', value: 3 }, 'FOUR'],
			value: 3,
			appendTo: container,
		});

		expect(getByRole(container, 'combobox')).toBeVisible();
	});

	test('renders as select element', () => {
		const select = new Select({ appendTo: container });

		expect(select.elem.tagName).toBe('SELECT');
		expect(getByRole(container, 'combobox')).toBeDefined();
	});

	test('creates option elements from string array', () => {
		const options = ['Option 1', 'Option 2', 'Option 3'];

		new Select({ options, appendTo: container });

		const optionElements = getAllByRole(container, 'option');
		expect(optionElements).toHaveLength(3);

		optionElements.forEach((option, index) => {
			expect(option.value).toBe(options[index]);
			expect(option.label).toBe(options[index]);
		});
	});

	test('creates option elements from object array', () => {
		const options = [
			{ label: 'First', value: 1 },
			{ label: 'Second', value: 2 },
			{ label: 'Third', value: 3 },
		];

		new Select({ options, appendTo: container });

		const optionElements = getAllByRole(container, 'option');
		expect(optionElements).toHaveLength(3);

		optionElements.forEach((option, index) => {
			expect(option.value).toBe(String(options[index].value));
			expect(option.label).toBe(options[index].label);
		});
	});

	test('handles mixed string and object options', () => {
		const options = ['Simple String', { label: 'Object Option', value: 'obj-value' }, 'Another String'];

		new Select({ options, appendTo: container });

		const optionElements = getAllByRole(container, 'option');
		expect(optionElements).toHaveLength(3);

		expect(optionElements[0].value).toBe('Simple String');
		expect(optionElements[0].label).toBe('Simple String');
		expect(optionElements[1].value).toBe('obj-value');
		expect(optionElements[1].label).toBe('Object Option');
		expect(optionElements[2].value).toBe('Another String');
		expect(optionElements[2].label).toBe('Another String');
	});

	test('sets and gets value correctly', () => {
		const options = ['A', 'B', 'C'];
		const select = new Select({ options, appendTo: container });

		select.value = 'B';
		expect(select.elem.value).toBe('B');
		expect(select.value).toBe('B');
	});

	test('gets selected option value from complex options', () => {
		const options = [
			{ label: 'First Option', value: 'first' },
			{ label: 'Second Option', value: 'second' },
			{ label: 'Third Option', value: 'third' },
		];

		const select = new Select({ options, value: 'second', appendTo: container });

		expect(select.value).toBe('second');
	});

	test('empties options when set to null', () => {
		const select = new Select({
			options: ['A', 'B', 'C'],
			appendTo: container,
		});

		const optionElements = getAllByRole(container, 'option');
		expect(optionElements).toHaveLength(3);

		select.options.options = null;

		// eslint-disable-next-line testing-library/no-node-access
		const options = container.querySelectorAll('option');
		expect(options).toHaveLength(0);
	});

	test('extends Input class', () => {
		const select = new Select({
			options: ['A', 'B'],
			value: 'A',
			appendTo: container,
		});

		// Should have Input functionality
		expect(select.initialValue).toBe('A');
		expect(select.isDirty).toBe(false);
	});

	test('handles change events like Input', () => {
		const onChange = mock(() => {});
		const select = new Select({
			options: ['A', 'B', 'C'],
			onChange,
			appendTo: container,
		});

		// Simulate selection change
		select.elem.value = 'B';
		select.elem.dispatchEvent(new Event('change'));

		expect(onChange).toHaveBeenCalled();
	});

	test('supports validation like Input', () => {
		const select = new Select({
			options: ['', 'Valid Option'],
			value: '',
			validations: [[/.+/, 'Please select an option']],
			appendTo: container,
		});

		const errors = select.validate();
		expect(errors).toHaveLength(1);
		expect(select.elem.className).toContain('validationErrors');

		select.options.value = 'Valid Option'; // Set through options like other components
		const noErrors = select.validate();
		expect(noErrors).toBe(undefined); // Returns undefined when no errors like Input
	});
});
