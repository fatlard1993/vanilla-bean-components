import { watch } from 'fs';
import { buildLoader as asText } from '../plugins/asText';
import { buildLoader as markdownLoader } from '../plugins/markdownLoader';

const build = async () => {
	console.log('Building...');

	const buildResults = await Bun.build({
		entrypoints: ['demo/index.js'],
		outdir: 'demo/build',
		define: {
			'process.env.AUTOPREFIXER_GRID': 'undefined',
		},
		plugins: [asText, markdownLoader],
	});

	console.log(buildResults.success ? 'build.success' : buildResults.logs);

	return buildResults;
};

const developmentMode = process.argv[2] === '--dev';
const watcherIgnore = /\.asText$|^demo\/build|^\.|^img\/|^docs\/|^devTools\//;

if (developmentMode) {
	console.log(`Initializing watcher`);

	const watcher = watch(`${import.meta.dir}/..`, { recursive: true }, (event, filename) => {
		if (watcherIgnore.test(filename)) return;

		console.log(`Detected ${event} in ${filename}`);

		build();
	});

	process.on('SIGINT', () => {
		watcher.close();
		process.exit(0);
	});
}

await build();
