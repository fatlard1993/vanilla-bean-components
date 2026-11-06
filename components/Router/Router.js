import { Component } from '../../Component';
import { pathMatch } from '../../app/pathMatch';

/**
 * Client-side router component with hash-based or history API routing and dynamic view rendering.
 *
 * Provides single-page application routing with support for route parameters,
 * dynamic view rendering, and browser history integration.
 * @param {object} [options={}] - Router configuration options
 * @param {object} options.views - Object mapping route patterns to component classes
 * @param {string} [options.defaultPath] - Default route path, uses first view key if not specified
 * @param {Component} [options.notFound] - Component class for 404/not found routes
 * @param {Function} [options.onRenderView] - Callback fired when rendering a new view
 * @param {'hash'|'history'} [options.mode='hash'] - Routing mode: 'hash' uses URL fragments, 'history' uses pushState
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Router} Router component instance
 */
class Router extends Component {
	// Routing config read from this.options by the path getters and renderView()
	static schema = {
		views: {},
		defaultPath: {},
		notFound: {},
		onRenderView: {},
		mode: { default: 'hash', enum: ['hash', 'history'] },
	};

	static prepareOptions(options) {
		return {
			defaultPath: Object.keys(options.views || {})[0],
			...options,
			style: {
				display: 'flex',
				flex: 1,
				overflow: 'hidden',
				...options.style,
			},
		};
	}

	/**
	 * Gets the current path from the URL.
	 * @returns {string} Current route path
	 */
	get path() {
		if (this.options.mode === 'history') return window.location.pathname;

		return window.location.hash.replace(/^#\/?/, '/').replace(/\?.*$/, '');
	}

	/**
	 * Sets the current path and triggers view rendering.
	 * @param {string} path - New route path to navigate to
	 */
	set path(path) {
		if (this.options.mode === 'history') {
			window.history.pushState(null, '', path);
		} else {
			window.location.hash = path;
		}

		this.renderView();
	}

	/**
	 * Gets the matched route for the current path.
	 * @returns {string} Matched route pattern
	 */
	get route() {
		return this.pathToRoute(this.path);
	}

	pathToRoute(path) {
		if (this.options.views[path]) return path;

		const sorted = Object.keys(this.options.views).sort((a, b) => {
			const aParams = (a.match(/:/g) || []).length;
			const bParams = (b.match(/:/g) || []).length;
			return aParams !== bParams ? aParams - bParams : b.length - a.length;
		});

		return sorted.find(route => pathMatch(route, path)) || path;
	}

	/**
	 * Extracts route parameters from a path, decoded.
	 * @param {string} [path] - Path to parse, defaults to current path
	 * @returns {object} Object containing route parameters
	 */
	parseRouteParameters(path = this.path) {
		return pathMatch(this.pathToRoute(path), path) ?? {};
	}

	build() {
		const reRenderView = () => this.renderView();

		window.addEventListener('popstate', reRenderView, { signal: this.signal });
		if (this.options.mode !== 'history') window.addEventListener('hashchange', reRenderView, { signal: this.signal });

		this.renderView();
	}

	renderView(route = this.route || this.options.defaultPath) {
		// No views and no path: nothing to show, and no "undefined" to write into the URL
		if (!route) return;
		// The same route with different parameters (/items/a to /items/b) is a different view
		if (this.currentRoute === route && this.currentPath === this.path) return;

		this.view?.destroy?.();
		this.view = null;
		this.empty();

		if (!this.path) return (this.path = route);

		this.currentRoute = route;
		this.currentPath = this.path;

		const { views, notFound, defaultPath } = this.options;

		if (views[route]) {
			this.options.onRenderView?.(route);
			this.view = new views[route]({ appendTo: this.elem, ...this.parseRouteParameters() });
		} else if (defaultPath && views[defaultPath] && this.path !== defaultPath) {
			// An unknown path goes to the default; notFound is the last resort, for when there is no default to go to
			this.path = defaultPath;
		} else if (notFound) {
			this.options.onRenderView?.(route);
			this.view = new notFound({ appendTo: this.elem, route });
		}
	}
}

export default Router;
