import { findAllByText } from '@testing-library/dom';

import { Router, View } from '.';

const textContent = 'textContent';

class TestView extends View {
	constructor(options) {
		super({ textContent, ...options });
	}
}

describe('Router', () => {
	// The router writes its default path into the hash; the next suite starts with the URL it expects
	afterEach(() => {
		window.location.hash = '';
	});

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

describe('Router matching', () => {
	test('a route with regex characters matches only itself', () => {
		const router = new Router({ views: { '/v1.2/notes': View, '/:section/notes': View }, autoRender: false });

		expect(router.pathToRoute('/v1.2/notes')).toBe('/v1.2/notes');
		expect(router.pathToRoute('/v1x2/notes')).toBe('/:section/notes');
	});

	test('a parameter comes to the view decoded', () => {
		const router = new Router({ views: { '/tags/:tag': View }, autoRender: false });

		expect(router.parseRouteParameters('/tags/rock%20%26%20roll')).toEqual({ tag: 'rock & roll' });
	});
});

describe('Router routes', () => {
	class NotFound extends View {
		constructor(options) {
			super({ textContent: `missing ${options.route}`, ...options });
		}
	}

	afterEach(() => {
		window.location.hash = '';
	});

	test('with no default to fall back to, an unknown path shows the notFound view', async () => {
		window.location.hash = '/nope';

		const router = new Router({
			views: { '/': TestView },
			defaultPath: null,
			notFound: NotFound,
			appendTo: container,
		});

		await findAllByText(container, 'missing /nope');

		expect(window.location.hash).toBe('#/nope');
		router.destroy();
	});

	test('without a notFound view an unknown path goes to the default', async () => {
		window.location.hash = '/nope';

		const router = new Router({ views: { '/home': TestView }, appendTo: container });

		await findAllByText(container, textContent);

		expect(window.location.hash).toBe('#/home');
		router.destroy();
	});

	test('no views writes nothing into the URL', () => {
		const router = new Router({ views: {}, appendTo: container });

		expect(window.location.hash).toBe('');
		router.destroy();
	});
});
