export const routeToRegex = route => {
	return new RegExp(`^${route.replaceAll(/:[^/]+/g, '([^/]+)')}$`);
};
