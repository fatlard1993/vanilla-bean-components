import { DomElem } from '../DomElem';
import { routeToRegex } from './utils';

class Router extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				defaultPath: Object.keys(options.views)[0],
				...options,
				styles: (theme, domElem) => `
					display: flex;
					flex: 1;
					overflow: hidden;

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);
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
		return this.options.views[path]
			? path
			: Object.keys(this.options.views).find(route => routeToRegex(route).test(path)) || path;
	}

	parseRouteParameters(path = this.path) {
		const route = this.pathToRoute(path);
		const routeRegex = routeToRegex(route);
		let routeParameterValues = path.match(routeRegex);
		let routeParameterKeys = route.match(routeRegex);
		const parameters = {};

		routeParameterValues = routeParameterValues.slice(1);
		routeParameterKeys = routeParameterKeys.slice(1);

		routeParameterValues.forEach((parameter, index) => {
			const name = routeParameterKeys[index].slice(1);

			parameters[name] = parameter;
		});

		return parameters;
	}

	render() {
		super.render();

		const reRenderView = () => this.renderView();

		window.addEventListener('popstate', reRenderView);

		this.options.onDisconnected = () => {
			window.removeEventListener('popstate', reRenderView);
		};

		this.renderView();
	}

	renderView(route = this.route || this.options.defaultPath) {
		this.options.onRenderView?.(route);

		this.empty();

		if (!this.path) return (this.path = route);

		if (this.options.views[route]) {
			this.view = new this.options.views[route]({ appendTo: this.elem, ...this.parseRouteParameters() });
		} else if (this.options.notFound) this.view = new this.options.notFound({ appendTo: this.elem, route });
		else if (this.options.defaultPath && this.path !== this.options.defaultPath) this.path = this.options.defaultPath;
	}
}

export default Router;
