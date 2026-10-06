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

describe('Router parameters', () => {
	test('a new parameter on the same route renders a new view', async () => {
		class ItemView extends View {
			constructor(options) {
				super({ textContent: `item ${options.id}`, ...options });
			}
		}

		// Driven directly rather than through window.location, which other suites leave in their own state
		let currentPath = '/items/a';

		class TestRouter extends Router {
			get path() {
				return currentPath;
			}

			set path(path) {
				currentPath = path;
				this.renderView();
			}
		}

		const router = new TestRouter({ views: { '/items/:id': ItemView }, appendTo: container });

		await findAllByText(container, 'item a');

		router.path = '/items/b';
		await findAllByText(container, 'item b');
	});
});
