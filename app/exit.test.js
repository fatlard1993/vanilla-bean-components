import { handleExit } from './exit';

describe('handleExit', () => {
	let exit;

	beforeEach(() => {
		exit = spyOn(process, 'exit').mockImplementation(() => {});
		spyOn(console, 'warn').mockImplementation(() => {});
		spyOn(console, 'error').mockImplementation(() => {});
	});

	const exitedWith = async () => {
		await new Promise(resolve => setTimeout(resolve));

		return exit.mock.calls.at(-1)?.[0];
	};

	test('pending writes are flushed before Ctrl+C or a stop request ends the process', async () => {
		const flush = mock(async () => {});

		handleExit({ flush });

		process.emit('SIGINT');
		expect(await exitedWith()).toBe(130);

		process.emit('SIGTERM');
		expect(await exitedWith()).toBe(0);
		expect(flush).toHaveBeenCalledTimes(2);
	});

	test('a flush that fails still exits', async () => {
		handleExit({ flush: () => Promise.reject(new Error('disk full')) });

		process.emit('SIGTERM');

		expect(await exitedWith()).toBe(0);
	});

	test('an uncaught error exits, unless the process is meant to survive it', async () => {
		handleExit();
		process.emit('uncaughtException', new Error('stray'));
		expect(await exitedWith()).toBe(99);

		exit.mockClear();
		handleExit({ survive: true });
		process.emit('uncaughtException', new Error('stray'));
		expect(await exitedWith()).toBeUndefined();
	});

	test('calling it again, as bun --hot does, adds no second set of listeners', () => {
		const listeners = process.listenerCount('SIGTERM');

		handleExit();

		expect(process.listenerCount('SIGTERM')).toBe(listeners);
	});
});
