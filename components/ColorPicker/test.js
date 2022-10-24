import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import ColorPicker from '.';

const container = new JSDOM().window.document.body;

describe('ColorPicker', () => {
	test('must render', async () => {
		const label = 'test:ColorPicker';

		new ColorPicker({ label, appendTo: container });

		await findByText(container, label);
	});
});
