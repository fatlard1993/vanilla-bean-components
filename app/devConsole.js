import { hotReload } from './hotReload';

// bun --hot evaluates the server again on every change; one reader stays on stdin and uses the newest handler
const state = (globalThis[Symbol.for('@vanilla-bean/components/app/devConsole')] ??= {
	handle: undefined,
	reading: false,
});

const run = async line => {
	const command = line.trim();

	if (['stop', 'close', 'exit'].includes(command)) return process.kill(process.pid, 'SIGTERM');

	if (command === 'b' || command === 'build') {
		console.log('>> Building...');

		return hotReload.rebuild();
	}

	if (!command) return;

	if (state.handle) return state.handle(command);

	console.log('Commands: b (build), stop');
};

/**
 * Commands typed into the dev server's terminal, in development only: `b` (or `build`) rebuilds the client and reloads
 * its pages, `stop` ends the server, and any other line goes to `handle`. A command that throws is logged, and the
 * console keeps reading.
 * @example devConsole(line => line === 'games' && console.log(server.games));
 * @param {Function} [handle] - (line) => anything, maybe async, for the app's own commands
 * @param {object} [options] - Options
 * @param {object} [options.lines] - Where lines come from: any async iterable of strings
 * @returns {Promise<void>} Settles when the lines run out
 */
export const devConsole = async (handle, { lines = console } = {}) => {
	state.handle = handle;

	if (process.env.NODE_ENV !== 'development' || state.reading) return;

	state.reading = true;

	try {
		for await (const line of lines) {
			try {
				await run(line);
			} catch (error) {
				console.error(`Command failed: ${line}`, error);
			}
		}
	} finally {
		state.reading = false;
	}
};
