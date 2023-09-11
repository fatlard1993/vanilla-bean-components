import { findByText } from '@testing-library/dom';

import { Label } from '.';

describe('Label', () => {
	test('must render', async () => {
		const label = 'label';

		new Label({ label, appendTo: container });

		await findByText(container, label);
	});
});
