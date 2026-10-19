import { buildClient } from '../app/buildClient';
import { buildLoader as asText } from '../plugins/asText';
import { buildLoader as markdownLoader } from '../plugins/markdownLoader';

export const buildOptions = {
	entrypoints: ['demo/index.html'],
	outdir: 'demo/build',
	plugins: [asText, markdownLoader],
	// Names kept: each demo view finds its README, source and lld document by its component's class name
	minify: { whitespace: true, syntax: true, identifiers: false },
};

if (import.meta.main) {
	const { success } = await buildClient(buildOptions);

	if (!success) process.exit(1);
}
