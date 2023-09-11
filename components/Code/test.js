import { findByText } from '@testing-library/dom';

import { Code } from '.';

describe('Code', () => {
	test('must render', async () => {
		const code = 'code';

		new Code({ code, appendTo: container });

		await findByText(container, code);
	});
});
