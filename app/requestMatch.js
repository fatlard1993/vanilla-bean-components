const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const patterns = new Map();

const compile = pattern => {
	if (!patterns.has(pattern)) {
		const names = [];
		const source = pattern
			.split('/')
			.map(segment => {
				if (!segment.startsWith(':')) return escapeRegExp(segment);

				names.push(segment.slice(1));

				return '([^/]+)';
			})
			.join('/');

		patterns.set(pattern, { names, regExp: new RegExp(`^${source}$`) });
	}

	return patterns.get(pattern);
};

/**
 * Match a request against a method and a path pattern with `:named` segments.
 * @example requestMatch('GET', '/games/:id', request) // → { id: '123', ...searchParams } or false
 * @param {string} method - HTTP method
 * @param {string} pattern - Path pattern; `:name` matches one segment
 * @param {Request} request - The incoming request
 * @returns {object|false} Search params and named segments (decoded), or false when it doesn't match
 */
export const requestMatch = (method, pattern, request) => {
	if (method !== request.method) return false;

	const url = new URL(request.url);
	const { names, regExp } = compile(pattern);
	const values = regExp.exec(url.pathname)?.slice(1);

	if (!values) return false;

	const result = Object.fromEntries(url.searchParams);

	try {
		names.forEach((name, index) => (result[name] = decodeURIComponent(values[index])));
	} catch {
		return false;
	}

	return result;
};
