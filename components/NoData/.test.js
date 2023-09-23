import { findByText } from '@testing-library/dom';

import { NoData } from '.';

describe('NoData', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new NoData({ textContent, appendTo: container });

		await findByText(container, textContent);
	});
});
