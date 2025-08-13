/**
 * Hydrates a URL string by replacing colon-prefixed parameters with encoded values
 * @param {string} url - URL with colon-prefixed variables (e.g., "/users/:id")
 * @param {object} [parameters] - Key-value pairs matching URL variables
 * @returns {string} URL with parameters replaced and URI-encoded
 * @example
 * hydrateUrl("/users/:id", { id: "123" }) // "/users/123"
 */
export const hydrateUrl = (url, parameters = {}) => {
	let hydratedUrl = url;

	Object.entries(parameters)
		.filter(([, value]) => typeof value === 'string' && value.length > 0)
		.forEach(([key, value]) => {
			hydratedUrl = hydratedUrl.replace(`:${key}`, encodeURIComponent(value));
		});

	return hydratedUrl;
};
