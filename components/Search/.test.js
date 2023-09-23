import { findByRole, findByDisplayValue } from '@testing-library/dom';

import { Search } from '.';

describe('Search', () => {
	test('must render', async () => {
		const value = 'search';

		new Search({ value, appendTo: container });

		await findByRole(container, 'searchbox');
		await findByDisplayValue(container, value);
	});
});
