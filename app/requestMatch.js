import { pathMatch } from './pathMatch';

/**
 * Match a request against a method and a path pattern with `:named` segments, as the client Router matches its routes.
 * @example requestMatch('GET', '/games/:id', request) // → { id: '123', ...searchParams } or false
 * @param {string} method - HTTP method
 * @param {string} pattern - Path pattern; `:name` matches one segment
 * @param {Request} request - The incoming request
 * @returns {object|false} Search params and named segments (decoded), or false when it doesn't match
 */
export const requestMatch = (method, pattern, request) => {
	if (method !== request.method) return false;

	const url = new URL(request.url);
	const segments = pathMatch(pattern, url.pathname);

	return segments ? { ...Object.fromEntries(url.searchParams), ...segments } : false;
};
