import DomElem from '../DomElem';

import { dom } from '../../utils';

export class Router extends DomElem {
	constructor(options) {
		super(options);

		window.addEventListener('popstate', () => this.renderView());
	}

	get path() {
		return window.location.hash.replace(/^#\/?/, '/').replace(/\?.*$/, '');
	}

	set path(path) {
		if (!this.views[this.pathToRoute(path)]) path = this.defaultPath;

		window.location.hash = path;

		this.renderView();
	}

	get route() {
		return this.pathToRoute(this.path);
	}

	pathToRoute(path) {
		return this.views[path] ? path : Object.keys(this.views).find(route => this.routeToRegex(route).test(path));
	}

	routeToPath(route, params) {
		let path = route;

		if (params) {
			Object.keys(params).forEach(key => {
				path = path.replace(new RegExp(`:${key}`), params[key]);
			});
		} else {
			path = path.replace(/\/?:[^/]+/g, '');
		}

		return path;
	}

	routeToRegex(route) {
		return new RegExp(`^${route.replace(/\//g, '\\/').replace(/:[^/]+/g, '([^/]+)')}$`);
	}

	buildPath(route, params) {
		if (!this.views[route]) route = this.defaultPath;

		return this.routeToPath(route, params);
	}

	parseRouteParams(path = this.path) {
		const route = this.pathToRoute(path);
		const routeRegex = this.routeToRegex(route);
		let routeParamValues = path.match(routeRegex);
		let routeParamKeys = route.match(routeRegex);
		const params = {};

		routeParamValues = routeParamValues.slice(1, routeParamValues.length);
		routeParamKeys = routeParamKeys.slice(1, routeParamKeys.length);

		routeParamValues.forEach((param, index) => {
			const name = routeParamKeys[index].slice(1);

			params[name] = param;
		});

		return params;
	}

	render({ views, paths, defaultPath, ...options } = this.options) {
		this.views = views;
		this.paths = paths;
		this.defaultPath = defaultPath;

		super.render(options);

		this.renderView(this.route || this.defaultPath);
	}

	renderView(view = this.route || this.defaultPath) {
		dom.empty(this.elem);

		if (this.views[view]) this.view = new this.views[view]({ appendTo: this.elem });
	}
}

export default Router;
