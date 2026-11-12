import { findByText, getAllByRole, getByRole, getByText } from '@testing-library/dom';

import { Label } from '../Label';
import { RadioButton } from '.';

describe('RadioButton', () => {
	test('must render', async () => {
		new RadioButton({ options: ['one', 'two'], appendTo: container });

		await findByText(container, 'one');
	});

	test('choosing an option is a change, with the option as event.value', () => {
		const onChange = mock();
		const radio = new RadioButton({ options: ['one', 'two'], onChange, appendTo: container });
		// eslint-disable-next-line testing-library/no-node-access
		const two = radio.elem.querySelectorAll('input')[1];

		two.click();

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0].value).toBe('two');
		expect(radio.options.value).toBe('two');
	});
});

describe('RadioButton values', () => {
	test('zero is a value: it can be checked, and picking keeps the type it was given', () => {
		const radio = new RadioButton({
			options: [
				{ label: 'zero', value: 0 },
				{ label: 'one', value: 1 },
			],
			value: 0,
			appendTo: container,
		});
		// eslint-disable-next-line testing-library/no-node-access
		const inputs = radio.elem.querySelectorAll('input');

		expect(inputs[0].value).toBe('0');
		expect(inputs[0].checked).toBe(true);

		inputs[1].checked = true;
		inputs[1].dispatchEvent(new Event('change', { bubbles: true }));

		expect(radio.options.value).toBe(1);

		radio.options.options = [...radio.options.options];

		// eslint-disable-next-line testing-library/no-node-access
		expect(radio.elem.querySelectorAll('input')[1].checked).toBe(true);
	});
});

describe('RadioButton as a group', () => {
	test('the group is a radiogroup, and its label names it and is shown', () => {
		const radio = new RadioButton({ label: 'Size', options: ['S', 'M'], appendTo: container });
		const group = getByRole(container, 'radiogroup', { name: 'Size' });

		expect(group).toBe(radio.elem);
		expect(getByText(group, 'Size')).toBeVisible();

		radio.options.options = ['S', 'M', 'L'];

		expect(getAllByRole(group, 'radio')).toHaveLength(3);
		expect(getByRole(container, 'radiogroup', { name: 'Size' })).toBe(group);

		radio.options.label = 'Shirt size';

		expect(getByRole(container, 'radiogroup', { name: 'Shirt size' })).toBe(group);
	});

	test('with no label it is still a radiogroup, claiming no name', () => {
		const radio = new RadioButton({ options: ['a'], appendTo: container });

		expect(radio.elem).toHaveAttribute('role', 'radiogroup');
		expect(radio.elem).not.toHaveAttribute('aria-labelledby');
	});

	test('a Label around the group names it', () => {
		const radio = new RadioButton({ options: ['S', 'M'] });

		new Label({ label: 'Size', appendTo: container }, radio);

		expect(getByRole(container, 'radiogroup', { name: 'Size' })).toBe(radio.elem);
		// Each radio is still named by its own text, not by the group's label
		expect(getByRole(container, 'radio', { name: 'S' })).toBeDefined();
	});
});
