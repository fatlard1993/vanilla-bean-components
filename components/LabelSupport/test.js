import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { LabelSupport } from '.';

const container = new JSDOM().window.document.body;

describe('Label', () => {
	test('must render', async () => {
		const label = 'label';

		new LabelSupport({ label, appendTo: container });

		await findByText(container, label);
	});
});
