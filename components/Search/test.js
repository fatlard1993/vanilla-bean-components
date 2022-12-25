import { findByRole, findByDisplayValue } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Search from '.';

const container = new JSDOM().window.document.body;

describe('Search', () => {
	test('must render', async () => {
		const value = 'search';

		new Search({ value, appendTo: container });

		await findByRole(container, 'searchbox');
		await findByDisplayValue(container, value);
	});
});
