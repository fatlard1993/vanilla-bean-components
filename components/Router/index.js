import DomElem from '../DomElem';

export class Router {
	constructor({ views, paths, defaultPath, ...rest }) {
		this.views = views;
		this.paths = paths;
		this.defaultPath = defaultPath;

		window.addEventListener('popstate', () => this.renderView());

		this.render(rest);
	}

	get path() {
		return window.location.hash.replace(/^#\/?/, '/');
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

	render({ className, ...rest } = {}) {
		this?.elem?.cleanup();

		this.elem = new DomElem('div', { className: ['router', className], ...rest });

		this.renderView(this.defaultPath);
	}

	renderView(view) {
		const route = view || this.route;

		this?.view?.cleanup();

		if (!this.views[route]) return;

		this.view = new this.views[route]({ appendTo: this.elem });
	}
}

export default Router;
