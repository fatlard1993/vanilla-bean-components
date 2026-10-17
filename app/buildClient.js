/**
 * Bundle the client once. Development builds keep console output and add source maps; production builds minify.
 * `process.env.NODE_ENV` is defined in the bundle, so development-only client code drops out of production builds.
 * @param {object} [options] - Bun.build options; these defaults apply where none are given
 * @param {string[]} [options.entrypoints] - Defaults to `['client/index.html']`
 * @param {string} [options.outdir] - Defaults to `'client/build'`
 * @param {boolean} [options.production] - Defaults to true; hotReload.watch builds with false
 * @param {object} [options.define] - Merged over the `process.env.NODE_ENV` define
 * @returns {Promise<object>} The Bun.build result
 */
export const buildClient = async ({
	entrypoints = ['client/index.html'],
	outdir = 'client/build',
	production = true,
	define,
	...options
} = {}) => {
	const startedAt = performance.now();

	const result = await Bun.build({
		entrypoints,
		outdir,
		minify: production,
		sourcemap: production ? 'none' : 'linked',
		...options,
		define: {
			'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
			...define,
		},
	});

	if (result.success) console.log(`Built ${outdir} in ${Math.round(performance.now() - startedAt)}ms`);
	else console.error('Build failed', ...result.logs);

	return result;
};
