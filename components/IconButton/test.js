import { findByRole } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import IconButton from '.';

const container = new JSDOM().window.document.body;

describe('IconButton', () => {
	test('must render', async () => {
		const name = 'test:iconButton';

		new IconButton({ textContent: name, appendTo: container });

		await findByRole(container, 'button', { name });
	});
});
