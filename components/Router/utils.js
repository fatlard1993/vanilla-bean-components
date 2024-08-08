export const routeToPath = (route, parameters) => {
	let path = route;

	if (parameters) {
		Object.keys(parameters).forEach(key => {
			path = path.replace(new RegExp(`:${key}`), parameters[key]);
		});
	} else {
		path = path.replaceAll(/\/?:[^/]+/g, '');
	}

	return path;
};

export const routeToRegex = route => {
	return new RegExp(`^${route.replaceAll('\\', String.raw`\/`).replaceAll(/:[^/]+/g, '([^/]+)')}$`);
};
