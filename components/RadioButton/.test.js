import { findByText } from '@testing-library/dom';

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
