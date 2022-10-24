import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import ModalDialog from '.';

const container = new JSDOM().window.document.body;

describe('ModalDialog', () => {
	test('must render', async () => {
		const header = 'header';
		const content = 'content';

		new ModalDialog({ header, content, appendTo: container });

		await findByText(container, header);
		await findByText(container, content);
	});
});
