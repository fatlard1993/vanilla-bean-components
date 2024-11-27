import { writeFileSync, unlink } from 'node:fs';
import { dirname, resolve } from 'node:path';

const onResolve = ({ path, importer }) => {
	path = resolve(dirname(importer), path);

	writeFileSync(path, '');

	unlink(path, error => error && console.error(error));

	return { path };
};

const onLoad =
	format =>
	async ({ path }) => {
		const text = await Bun.file(path.replace('.asText', '')).text();

		return format === 'build' ? { contents: text, loader: 'text' } : { exports: { default: text }, loader: 'object' };
	};

export const buildLoader = {
	name: '.asText build loader',
	async setup(build) {
		build.onResolve({ filter: /\.asText$/ }, onResolve);

		build.onLoad({ filter: /\.asText$/ }, onLoad('build'));
	},
};

export const runtimeLoader = {
	name: '.asText runtime loader',
	async setup(build) {
		build.onResolve({ filter: /\.asText$/ }, onResolve);

		build.onLoad({ filter: /\.asText$/ }, onLoad('runtime'));
	},
};
