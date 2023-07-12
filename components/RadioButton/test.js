import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import { RadioButton } from '.';

const container = new JSDOM().window.document.body;

describe('RadioButton', () => {
	test('must render', async () => {
		new RadioButton({ options: ['one', 'two'], appendTo: container });

		await findByText(container, 'one');
	});
});
