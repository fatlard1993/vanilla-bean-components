import { findAllByText } from '@testing-library/dom';

import { Router, View } from '.';

const textContent = 'textContent';

class TestView extends View {
	constructor(options) {
		super({ textContent, ...options });
	}
}

describe('Router', () => {
	test('must render default view', async () => {
		const views = { ['/Test']: TestView };

		new Router({ views, appendTo: container });

		await findAllByText(container, textContent);
	});
});
