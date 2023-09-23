import { findByText } from '@testing-library/dom';

import { Tooltip } from '.';

describe('Tooltip', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new Tooltip({ textContent, appendTo: container });

		await findByText(container, textContent);
	});
});
