import { dirname, resolve, sep } from 'path';

// What the library itself loads at runtime: Page links the icon and font stylesheets, theme.code the syntax font
const LIBRARY_ASSET_PACKAGES = [
	'@fortawesome/fontawesome-free',
	'@fontsource-variable/kode-mono',
	'@vanilla-bean/components',
];

const packageRoots = new Map();

// Resolved from the library first, so its own dependencies are found wherever the package manager put them
const packageRoot = name => {
	if (!packageRoots.has(name)) {
		let root = null;

		for (const from of [import.meta.dir, process.cwd()]) {
			try {
				root = dirname(Bun.resolveSync(`${name}/package.json`, from));
				break;
			} catch {
				// not resolvable from here
			}
		}

		packageRoots.set(name, root);
	}

	return packageRoots.get(name);
};

// Dot segments (.git, .env, ..) and nested node_modules are never served
const hiddenSegment = /^(\.|node_modules$)/;

const fileWithin = async (root, path) => {
	if (!root || path.split('/').some(segment => hiddenSegment.test(segment))) return;

	const base = resolve(root);
	const resolved = resolve(base, `.${path.endsWith('/') ? `${path}index.html` : path}`);

	if (!resolved.startsWith(base + sep)) return;

	const file = Bun.file(resolved);

	if (await file.exists()) return file;
};

/**
 * Serve the built client, plus the package files the library and the app load at runtime. Package files are matched
 * at any depth, since a relative href on a page at /games/123 asks for /games/@fortawesome/...
 * @param {Request} request - Any incoming request
 * @param {object} [options] - Where files come from
 * @param {string} [options.root] - The build output directory; defaults to `'client/build'`
 * @param {string[]} [options.packages] - Further packages whose files the client loads at runtime
 * @returns {Promise<Response|undefined>} The file, or undefined when there is none to serve
 */
export const serveStatic = async (request, { root = 'client/build', packages = [] } = {}) => {
	if (request.method !== 'GET' && request.method !== 'HEAD') return;

	let path;

	try {
		path = decodeURIComponent(new URL(request.url).pathname);
	} catch {
		return;
	}

	const built = await fileWithin(root, path);

	if (built) return new Response(built);

	for (const name of [...LIBRARY_ASSET_PACKAGES, ...packages]) {
		const index = path.indexOf(`/${name}/`);

		if (index === -1) continue;

		const file = await fileWithin(packageRoot(name), path.slice(index + name.length + 1));

		if (file) return new Response(file);
	}
};
