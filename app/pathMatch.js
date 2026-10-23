// Path patterns with `:named` segments, shared by the client's Router and the server's requestMatch

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
 * Match a path against a pattern. Everything but a `:name` segment is literal, regex characters included, and each
 * named value comes back decoded.
 * @example pathMatch('/games/:id', '/games/a%20b') // → { id: 'a b' }
 * @param {string} pattern - Path pattern; `:name` matches one segment
 * @param {string} path - The path to match, still URL-encoded
 * @returns {object|null} The named segments, or null when it doesn't match (or a value isn't valid encoding)
 */
export const pathMatch = (pattern, path) => {
	const { names, regExp } = compile(pattern);
	const values = regExp.exec(path)?.slice(1);

	if (!values) return null;

	try {
		return Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(values[index])]));
	} catch {
		return null;
	}
};
