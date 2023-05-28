import DomElem from '../DomElem';

import { dom } from '../../utils';

export class Router extends DomElem {
	constructor({ styles = () => '', ...options }) {
		if (!options.defaultPath) options.defaultPath = Object.keys(options.views)[0];

		super({
			styles: theme => `
				height: 100%;

				${styles(theme)}
			`,
			...options,
		});

		window.addEventListener('popstate', () => this.renderView());
	}

	get path() {
		return window.location.hash.replace(/^#\/?/, '/').replace(/\?.*$/, '');
	}

	set path(path) {
		window.location.hash = path;

		this.renderView();
	}

	get route() {
		return this.pathToRoute(this.path);
	}

	pathToRoute(path) {
		return this.views[path] ? path : Object.keys(this.views).find(route => this.routeToRegex(route).test(path)) || path;
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

	render({ views, defaultPath, notFound, ...options } = this.options) {
		this.views = views;
		this.defaultPath = defaultPath;
		this.notFound = notFound;

		super.render(options);

		this.renderView();
	}

	renderView(route = this.route || this.defaultPath) {
		dom.empty(this.elem);

		if (!this.path) return (this.path = route);

		if (this.views[route]) this.view = new this.views[route]({ appendTo: this.elem });
		else if (this.notFound) this.view = new this.notFound({ appendTo: this.elem, route });
		else this.path = this.defaultPath;
	}
}

export default Router;
