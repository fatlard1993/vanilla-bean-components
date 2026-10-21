// bun --hot evaluates the server again on every change; the listeners are installed once and read the newest options
const state = (globalThis[Symbol.for('@vanilla-bean/components/app/exit')] ??= { options: undefined });

const exit = async code => {
	try {
		await state.options.flush?.();
	} catch (error) {
		console.error('Flush before exit failed', error);
	}

	process.exit(code);
};

const failed = (label, code) => error => {
	console.error(label, error?.stack ?? error);

	if (!state.options.survive) exit(code);
};

/**
 * How the server process ends. Ctrl+C exits 130 and being asked to stop (a service manager, `kill`) exits 0, both after
 * `flush`. An uncaught error or unhandled rejection is logged, then exits 99 or 1 after `flush`, unless `survive`.
 * @example handleExit({ flush: () => database.flush() });
 * @param {object} [options] - Options
 * @param {Function} [options.flush] - Awaited before any exit, for writes still pending
 * @param {boolean} [options.survive] - Keep running after an uncaught error, for a process whose children must outlive one
 */
export const handleExit = (options = {}) => {
	const installed = !!state.options;

	state.options = options;

	if (installed) return;

	process.on('SIGINT', () => {
		console.warn('Clean Exit');
		exit(130);
	});
	process.on('SIGTERM', () => exit(0));
	process.on('uncaughtException', failed('Uncaught Exception', 99));
	process.on('unhandledRejection', failed('Unhandled Rejection', 1));
};
