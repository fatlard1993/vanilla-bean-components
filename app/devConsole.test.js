import { devConsole } from './devConsole';
import { hotReload } from './hotReload';

describe('devConsole', () => {
	const nodeEnv = process.env.NODE_ENV;

	beforeEach(() => (process.env.NODE_ENV = 'development'));
	afterAll(() => (process.env.NODE_ENV = nodeEnv));

	const typed = async function* (...lines) {
		yield* lines;
	};

	test('b rebuilds, and any other line goes to the app', async () => {
		const rebuild = spyOn(hotReload, 'rebuild').mockImplementation(() => {});
		const handle = mock();

		spyOn(console, 'log').mockImplementation(() => {});

		await devConsole(handle, { lines: typed('b', 'games 2') });

		expect(rebuild).toHaveBeenCalledTimes(1);
		expect(handle).toHaveBeenCalledWith('games 2');
	});

	test('a command that throws is logged, and the next one still runs', async () => {
		const error = spyOn(console, 'error').mockImplementation(() => {});
		const handle = mock(line => {
			if (line === 'boom') throw new Error('boom');
		});

		await devConsole(handle, { lines: typed('boom', 'after') });

		expect(error).toHaveBeenCalled();
		expect(handle).toHaveBeenLastCalledWith('after');
	});

	test('outside development, nothing is read', async () => {
		process.env.NODE_ENV = 'production';

		const handle = mock();

		await devConsole(handle, { lines: typed('games') });

		expect(handle).not.toHaveBeenCalled();
	});
});
