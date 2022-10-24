import { findByText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';

import Router from '.';
import View from '../View';

const container = new JSDOM().window.document.body;

const textContent = 'textContent';

class DemoView extends View {
	constructor(options) {
		super({ textContent, ...options });
	}
}

describe('Router', () => {
	test('must render', async () => {
		const paths = { demo: '/Demo' };
		const views = { '/Demo': DemoView };
		const defaultPath = paths.demo;

		new Router({ paths, views, defaultPath, appendTo: container });

		await findByText(container, textContent);
	});
});
