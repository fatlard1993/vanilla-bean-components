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
