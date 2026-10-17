import { watch as watchFiles } from 'fs';
import { resolve } from 'path';

import { buildClient } from './buildClient';
import { HOT_RELOAD_PATH } from './hotReloadPath';

// bun --hot evaluates this module again on every server change; the sockets and the watcher live on globalThis,
// which survives that, so a reload neither starts a second watcher nor forgets the pages already connected.
const state = (globalThis[Symbol.for('@vanilla-bean/components/app/hotReload')] ??= {
	sockets: new Set(),
	watcher: undefined,
	buildOptions: undefined,
	inputs: new Set(),
	pendingRebuild: undefined,
});

// The asText plugin writes, then removes, a placeholder beside each import while it builds, and reads the file named
// without the suffix
const asTextPlaceholder = /\.asText$/;

// Absolute paths of every file the last successful build read; a change to anything else needs no rebuild
const buildInputs = result =>
	new Set(Object.keys(result.metafile?.inputs ?? {}).map(input => resolve(input.replace(asTextPlaceholder, ''))));

const writtenByBuild = (path, outdir) => `${path}/`.startsWith(`${outdir}/`) || asTextPlaceholder.test(path);

const reloadPages = () => {
	for (const socket of state.sockets) socket.send('hotReload');
};

const build = async () => {
	const result = await buildClient({ ...state.buildOptions, production: false, metafile: true });

	if (result.success) state.inputs = buildInputs(result);

	return result;
};

const rebuild = async () => {
	const { watcher } = state;

	// A rebuild still running when the watcher stops reloads nothing
	if ((await build()).success && state.watcher === watcher) reloadPages();
};

/**
 * Development hot reload: rebuild the client when a file it was built from changes, then reload every page that loaded
 * `@vanilla-bean/components/app/reloadOnBuild`.
 */
export const hotReload = {
	websocket: {
		open(socket) {
			if (socket.data?.hotReload) state.sockets.add(socket);
		},
		close(socket) {
			state.sockets.delete(socket);
		},
	},

	/**
	 * Accept a page's hot reload socket, while watching. Bun wants nothing back from fetch for an upgraded request.
	 * @example if (hotReload.upgrade(request, server)) return;
	 * @param {Request} request - Any incoming request
	 * @param {object} server - The Bun server
	 * @returns {boolean} Whether the request became a hot reload socket
	 */
	upgrade(request, server) {
		if (!state.watcher || new URL(request.url).pathname !== HOT_RELOAD_PATH) return false;

		return server.upgrade(request, { data: { hotReload: true } });
	},

	/**
	 * Build the client, then rebuild whenever a file under the working directory that the build read changes. Later
	 * calls (a hot reload of the server) only replace the build options, used from the next rebuild.
	 * @param {object} [buildOptions] - Passed to buildClient
	 * @param {object} [watchOptions] - Watcher settings
	 * @param {number} [watchOptions.debounce] - Milliseconds of quiet before a rebuild
	 * @returns {Promise<object>} The first build's result
	 */
	watch(buildOptions = {}, { debounce: quietTime = 100 } = {}) {
		state.buildOptions = buildOptions;

		if (state.watcher) return state.watcher.firstBuild;

		const root = process.cwd();
		const scheduleRebuild = () => {
			clearTimeout(state.pendingRebuild);
			state.pendingRebuild = setTimeout(rebuild, quietTime);
		};

		const current = {};

		// Until a build succeeds there is nothing to compare against, so any change the build didn't make is worth a try.
		// A closed watcher can still deliver an event it had queued.
		const watcher = watchFiles(root, { recursive: true }, (event, filename) => {
			if (state.watcher !== current || !filename) return;

			const path = resolve(root, filename);
			const outdir = resolve(root, state.buildOptions.outdir ?? 'client/build');

			if (state.inputs.has(path) || (state.inputs.size === 0 && !writtenByBuild(path, outdir))) scheduleRebuild();
		});

		state.watcher = Object.assign(current, { close: () => watcher.close(), firstBuild: build() });

		return state.watcher.firstBuild;
	},

	/**
	 * Stop watching and forget connected pages.
	 */
	stop() {
		clearTimeout(state.pendingRebuild);
		state.watcher?.close();
		state.watcher = undefined;
		state.sockets.clear();
		state.inputs.clear();
	},
};
