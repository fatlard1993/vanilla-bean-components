import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { Code } from '.';

const container = new JSDOM().window.document.body;

describe('Code', () => {
	test('must render', async () => {
		const code = 'code';

		new Code({ code, appendTo: container });

		await findByText(container, code);
	});
});
