import { watch } from 'fs';
import { buildLoader as asText } from '../plugins/asText';
import { buildLoader as markdownLoader } from '../plugins/markdownLoader';

const build = async () => {
	console.log('Building...');

	const buildResults = await Bun.build({
		entrypoints: ['demo/index.html'],
		outdir: 'demo/build',
		define: {
			'process.env.AUTOPREFIXER_GRID': 'undefined',
			'process.cwd': 'String',
		},
		plugins: [asText, markdownLoader],
	});

	console.log(buildResults.success ? 'build.success' : buildResults.logs);

	return buildResults;
};

const enableWatcher = process.argv[2] === '--watch';
const watcherIgnore = /\.asText$|^demo\/build|^\.|^img\/|^devTools\//;

if (enableWatcher) {
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
