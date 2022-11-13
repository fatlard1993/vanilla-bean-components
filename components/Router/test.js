import { findAllByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Router from '.';
import View from '../View';

const container = new JSDOM().window.document.body;

const textContent = 'textContent';

class TestView extends View {
	constructor(options) {
		super({ textContent, ...options });
	}
}

describe('Router', () => {
	test('must render default view', async () => {
		const paths = { test: '/Test' };
		const views = { [paths.test]: TestView };

		new Router({ views, appendTo: container });

		await findAllByText(container, textContent);
	});
});
