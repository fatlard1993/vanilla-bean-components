import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Select from './';

const container = new JSDOM().window.document.body;

describe('Select', () => {
	test('must render', async () => {
		const label = 'textContent';

		new Select({
			label,
			options: ['one', '2', { label: 'Three', value: 3 }],
			value: 3,
			onChange: console.log,
			appendTo: container,
		});

		await findByText(container, label);
	});
});
