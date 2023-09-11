import { findByRole } from '@testing-library/dom';

import { Button } from '.';

describe('Button', () => {
	test('must render a button', async () => {
		const name = 'test:button';

		new Button({ textContent: name, appendTo: container });

		await findByRole(container, 'button', { name });
	});
});
