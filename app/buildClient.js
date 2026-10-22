import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, isAbsolute, join, relative } from 'path';

// The bundler hashes a linked manifest's name and leaves the paths inside it as written, so the files it names are copied
// into the build at those paths
const copyManifestFiles = (outputs, entrypoints, outdir) => {
	const sourceDirs = entrypoints.filter(entrypoint => entrypoint.endsWith('.html')).map(dirname);

	for (const { path, kind } of outputs) {
		if (kind !== 'asset' || !path.endsWith('.json')) continue;

		let manifest;

		try {
			manifest = JSON.parse(readFileSync(path, 'utf8'));
		} catch {
			continue;
		}

		const files = [...(manifest.icons || []), ...(manifest.screenshots || [])]
			.map(({ src } = {}) => src)
			.filter(src => typeof src === 'string' && !/^[a-z]+:|^\/\//i.test(src));

		const outputDir = dirname(path);
		const offset = relative(outdir, outputDir);

		for (const src of files) {
			const name = src.split(/[?#]/)[0].replace(/^\/+/, '');
			const from = sourceDirs
				.map(dir => join(dir, src.startsWith('/') ? '' : offset, name))
				.find(file => existsSync(file));

			if (!from) continue;

			const to = src.startsWith('/') ? join(outdir, name) : join(outputDir, name);

			mkdirSync(dirname(to), { recursive: true });
			copyFileSync(from, to);
		}
	}
};

/**
 * Bundle the client once. Development builds keep console output and add source maps; production builds minify.
 * `process.env.NODE_ENV` is defined in the bundle, so development-only client code drops out of production builds.
 * The files a linked manifest names in `icons` and `screenshots` are copied from beside the page into the build.
 * @param {object} [options] - Bun.build options; these defaults apply where none are given
 * @param {string[]} [options.entrypoints] - Defaults to `['client/index.html']`
 * @param {string} [options.outdir] - Defaults to `'client/build'`
 * @param {boolean} [options.production] - Defaults to true; hotReload.watch builds with false
 * @param {string} [options.publicPath] - Defaults to `'/'`, so a page at a deep route (`/games/12`) still finds its
 *   chunks; `''` makes them relative again, for an app served under a path prefix
 * @param {object} [options.define] - Merged over the `process.env.NODE_ENV` define
 * @returns {Promise<object>} The Bun.build result
 */
export const buildClient = async ({
	entrypoints = ['client/index.html'],
	outdir = 'client/build',
	production = true,
	publicPath = '/',
	define,
	...options
} = {}) => {
	const startedAt = performance.now();

	const result = await Bun.build({
		entrypoints,
		outdir,
		minify: production,
		sourcemap: production ? 'none' : 'linked',
		publicPath,
		...options,
		define: {
			'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
			...define,
		},
	});

	if (result.success) {
		copyManifestFiles(result.outputs, entrypoints, isAbsolute(outdir) ? outdir : join(process.cwd(), outdir));

		console.log(`Built ${outdir} in ${Math.round(performance.now() - startedAt)}ms`);
	} else console.error('Build failed', ...result.logs);

	return result;
};
