import { getByRole } from '@testing-library/dom';
import { toBeVisible } from '@testing-library/jest-dom/matchers';

import { Select } from '.';

describe('Select', () => {
	test('must render', async () => {
		new Select({
			options: ['one', '2', { label: 'Three', value: 3 }, 'FOUR'],
			value: 3,
			onChange: console.log,
			appendTo: container,
		});

		expect(toBeVisible(getByRole(container, 'combobox')).pass).toBe(true);
	});
});
