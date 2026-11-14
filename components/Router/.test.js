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

describe('Router links under history routing', () => {
	const views = { '/a': TestView, '/b': TestView };
	let router;

	// The test page starts at about:blank, which has no paths to route between
	beforeEach(() => {
		window.happyDOM.setURL('http://localhost/a');
		router = new Router({ mode: 'history', views, appendTo: container });
	});
	afterEach(() => {
		router.destroy();
		window.happyDOM.setURL('about:blank');
	});

	const click = (href, init = {}, attributes = {}) => {
		const link = Object.assign(document.createElement('a'), { href });

		Object.entries(attributes).forEach(([name, value]) => link.setAttribute(name, value));
		container.append(link);

		const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });

		link.dispatchEvent(event);
		link.remove();

		return event;
	};

	test('a plain click on a link to a route is routed, not followed', () => {
		const event = click('/b?x=1');

		expect(event.defaultPrevented).toBe(true);
		expect(window.location.pathname).toBe('/b');
		expect(window.location.search).toBe('?x=1');
		expect(router.currentPath).toBe('/b');
	});

	test('a click meant for a new tab, a download, another site, another target or a path not among its routes is left alone', () => {
		expect(click('/b', { ctrlKey: true }).defaultPrevented).toBe(false);
		expect(click('/b', { metaKey: true }).defaultPrevented).toBe(false);
		expect(click('/b', { button: 1 }).defaultPrevented).toBe(false);
		expect(click('/b', {}, { download: '' }).defaultPrevented).toBe(false);
		expect(click('/b', {}, { target: '_blank' }).defaultPrevented).toBe(false);
		expect(click('https://elsewhere.example/b').defaultPrevented).toBe(false);
		expect(click('/api/file.zip').defaultPrevented).toBe(false);
	});

	test('a click something else already handled is left to it', () => {
		const link = Object.assign(document.createElement('a'), { href: '/b' });

		link.addEventListener('click', event => event.preventDefault());
		container.append(link);
		link.click();
		link.remove();

		expect(window.location.pathname).toBe('/a');
	});
});
