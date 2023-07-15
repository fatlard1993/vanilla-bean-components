import { empty } from '../../utils';
import { DomElem } from '../DomElem';

class Router extends DomElem {
	constructor(options = {}) {
		const views = options.views || [];

		if (!options.defaultPath) options.defaultPath = Object.keys(views)[0];

		super({
			...options,
			styles: theme => `
				height: 100%;

				${options.styles?.(theme) || ''}
			`,
		});

		this.views = views;

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

	routeToPath(route, parameters) {
		let path = route;

		if (parameters) {
			Object.keys(parameters).forEach(key => {
				path = path.replace(new RegExp(`:${key}`), parameters[key]);
			});
		} else {
			path = path.replaceAll(/\/?:[^/]+/g, '');
		}

		return path;
	}

	routeToRegex(route) {
		return new RegExp(`^${route.replaceAll('\\', '\\/').replaceAll(/:[^/]+/g, '([^/]+)')}$`);
	}

	parseRouteParameters(path = this.path) {
		const route = this.pathToRoute(path);
		const routeRegex = this.routeToRegex(route);
		let routeParameterValues = path.match(routeRegex);
		let routeParameterKeys = route.match(routeRegex);
		const parameters = {};

		routeParameterValues = routeParameterValues.slice(1, routeParameterValues.length);
		routeParameterKeys = routeParameterKeys.slice(1, routeParameterKeys.length);

		routeParameterValues.forEach((parameter, index) => {
			const name = routeParameterKeys[index].slice(1);

			parameters[name] = parameter;
		});

		return parameters;
	}

	render({ views, defaultPath, notFound, ...options } = this.options) {
		this.views = views;
		this.defaultPath = defaultPath;
		this.notFound = notFound;

		super.render(options);

		this.renderView();
	}

	renderView(route = this.route || this.defaultPath) {
		empty(this.elem);

		if (!this.path) return (this.path = route);

		if (this.views[route]) this.view = new this.views[route]({ appendTo: this.elem });
		else if (this.notFound) this.view = new this.notFound({ appendTo: this.elem, route });
		else this.path = this.defaultPath;
	}
}

export default Router;
