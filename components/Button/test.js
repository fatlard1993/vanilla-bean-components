import { findByRole } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Button from '.';

const container = new JSDOM().window.document.body;

describe('Button', () => {
	test('must render a button', async () => {
		const name = 'test:button';

		new Button({ textContent: name, appendTo: container });

		await findByRole(container, 'button', { name });
	});
});
