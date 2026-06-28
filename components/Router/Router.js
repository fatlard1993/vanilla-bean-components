import { Component } from '../../Component';
import { routeToRegex } from './utils';

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
	constructor(options = {}, ...children) {
		super(
			{
				defaultPath: Object.keys(options.views)[0],
				...options,
				style: {
					display: 'flex',
					flex: 1,
					overflow: 'hidden',
					...options.style,
				},
			},
			...children,
		);
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

		return sorted.find(route => routeToRegex(route).test(path)) || path;
	}

	/**
	 * Extracts route parameters from a path.
	 * @param {string} [path] - Path to parse, defaults to current path
	 * @returns {object} Object containing route parameters
	 */
	parseRouteParameters(path = this.path) {
		const route = this.pathToRoute(path);
		const routeRegex = routeToRegex(route);
		let routeParameterValues = path.match(routeRegex);
		let routeParameterKeys = route.match(routeRegex);
		const parameters = {};

		if (!routeParameterValues || !routeParameterKeys) return parameters;

		routeParameterValues = routeParameterValues.slice(1);
		routeParameterKeys = routeParameterKeys.slice(1);

		routeParameterValues.forEach((parameter, index) => {
			const name = routeParameterKeys[index].slice(1);

			parameters[name] = parameter;
		});

		return parameters;
	}

	static handlers = {
		views() {},
		defaultPath() {},
		notFound() {},
		onRenderView() {},
		mode() {},
	};

	build() {
		const reRenderView = () => this.renderView();

		window.addEventListener('popstate', reRenderView);
		if (this.options.mode !== 'history') window.addEventListener('hashchange', reRenderView);
		this.replaceCleanup('popstate', () => {
			window.removeEventListener('popstate', reRenderView);
			if (this.options.mode !== 'history') window.removeEventListener('hashchange', reRenderView);
		});

		this.renderView();
	}

	renderView(route = this.route || this.options.defaultPath) {
		if (this.currentRoute === route) return;

		this.options.onRenderView?.(route);

		this.view?.destroy?.();
		this.empty();

		if (!this.path) return (this.path = route);

		this.currentRoute = route;

		if (this.options.views[route]) {
			this.view = new this.options.views[route]({ appendTo: this.elem, ...this.parseRouteParameters() });
		} else if (this.options.notFound) this.view = new this.options.notFound({ appendTo: this.elem, route });
		else if (this.options.defaultPath && this.path !== this.options.defaultPath) this.path = this.options.defaultPath;
	}
}

export default Router;

// Zero-arg scenarios for LLD verification
export const hashStripsQueryString = () => {
	const r = new Router({ views: { '/path': Component }, autoRender: false });
	window.location.hash = '#/path?query=1&sort=name';
	return r.path;
};

export const paramExtractedFromRoute = () => {
	const r = new Router({ views: { '/users/:id': Component }, autoRender: false });
	window.location.hash = '#/users/42';
	return r.parseRouteParameters('/users/42')?.id;
};
