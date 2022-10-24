import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Dialog from '.';

const container = new JSDOM().window.document.body;

describe('Dialog', () => {
	test('must render', async () => {
		const header = 'header';
		const content = 'content';

		new Dialog({ header, content, appendTo: container });

		await findByText(container, header);
		await findByText(container, content);
	});
});
