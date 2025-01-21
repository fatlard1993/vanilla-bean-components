/**
 * Hydrate a url string with values from an object
 * @param {string} url - The url string with variables prefixed with a colon. For example: /users/:id
 * @param {object} parameters - An object containing values with keys that match the variables in the url string. For example: { id: '1q2uw3' }
 * @returns {string} Random id string
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
