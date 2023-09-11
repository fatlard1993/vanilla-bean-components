import { getByRole } from '@testing-library/dom';

import { Select } from '.';

describe('Select', () => {
	test('must render', async () => {
		new Select({
			options: ['one', '2', { label: 'Three', value: 3 }, 'FOUR'],
			value: 3,
			onChange: console.log,
			appendTo: container,
		});

		expect(getByRole(container, 'combobox')).toBeVisible().toHaveValue('3');
	});
});
