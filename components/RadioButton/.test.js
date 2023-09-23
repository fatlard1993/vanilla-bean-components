import { findByText } from '@testing-library/dom';

import { RadioButton } from '.';

describe('RadioButton', () => {
	test('must render', async () => {
		new RadioButton({ options: ['one', 'two'], appendTo: container });

		await findByText(container, 'one');
	});
});
