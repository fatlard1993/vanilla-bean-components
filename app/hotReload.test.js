import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { delay } from '../utils/data';
import { HOT_RELOAD_DEBOUNCE, hotReload } from './hotReload';
import { HOT_RELOAD_PATH } from './hotReloadPath';

const pageSocket = () => ({ data: { hotReload: true }, send: mock() });

const until = async (check, timeout = 3000) => {
	const started = Date.now();

	while (!check()) {
		if (Date.now() - started > timeout) throw new Error('Timed out');

		await delay(20);
	}
};

describe('hotReload', () => {
	let root;
	let cwd;

	beforeAll(() => {
		cwd = process.cwd();
		root = mkdtempSync(join(tmpdir(), 'hotReload-'));
		mkdirSync(join(root, 'client'));
		writeFileSync(join(root, 'client/index.js'), 'globalThis.version = 1;\n');
		process.chdir(root);
	});

	afterEach(() => hotReload.stop());

	afterAll(() => {
		process.chdir(cwd);
		rmSync(root, { recursive: true, force: true });
	});

	const buildOptions = { entrypoints: ['client/index.js'], outdir: 'client/build' };
	// The wait these tests can sit through; left to itself the watcher waits HOT_RELOAD_DEBOUNCE
	const soon = { debounce: 50 };

	test('a file the client starts importing is watched from the next build', async () => {
		await hotReload.watch(buildOptions, soon);

		const page = pageSocket();

		hotReload.websocket.open(page);
		writeFileSync(join(root, 'client/helper.js'), 'export const helper = 1;\n');
		writeFileSync(join(root, 'client/index.js'), "import { helper } from './helper';\nglobalThis.helper = helper;\n");

		await until(() => page.send.mock.calls.length === 1);

		writeFileSync(join(root, 'client/helper.js'), 'export const helper = 2;\n');

		await until(() => page.send.mock.calls.length === 2);

		expect(await Bun.file(join(root, 'client/build/index.js')).text()).toContain('2');
	});

	test('rebuilds and reloads on request, only while watching', async () => {
		expect(hotReload.rebuild()).toBeUndefined();

		await hotReload.watch(buildOptions, soon);

		const page = pageSocket();

		hotReload.websocket.open(page);

		expect((await hotReload.rebuild()).success).toBe(true);
		expect(page.send).toHaveBeenCalledWith('hotReload');
	});

	test('takes no socket while not watching', () => {
		const server = { upgrade: mock(() => true) };

		expect(hotReload.upgrade(new Request(`http://localhost${HOT_RELOAD_PATH}`), server)).toBe(false);
		expect(server.upgrade).not.toHaveBeenCalled();
	});

	test('takes only its own path while watching', async () => {
		await hotReload.watch(buildOptions, soon);

		const server = { upgrade: mock(() => true) };

		expect(hotReload.upgrade(new Request('http://localhost/ws'), server)).toBe(false);
		expect(hotReload.upgrade(new Request(`http://localhost${HOT_RELOAD_PATH}`), server)).toBe(true);
		expect(server.upgrade.mock.calls[0][1]).toEqual({ data: { hotReload: true } });
	});

	test('builds, then reloads connected pages after each rebuild', async () => {
		const first = await hotReload.watch(buildOptions, soon);

		expect(first.success).toBe(true);

		const page = pageSocket();
		const otherSocket = { data: {}, send: mock() };

		hotReload.websocket.open(page);
		hotReload.websocket.open(otherSocket);

		writeFileSync(join(root, 'client/index.js'), 'globalThis.version = 2;\n');

		await until(() => page.send.mock.calls.length > 0);

		expect(page.send).toHaveBeenCalledWith('hotReload');
		expect(otherSocket.send).not.toHaveBeenCalled();
	});

	test('a closed page is not reloaded', async () => {
		await hotReload.watch(buildOptions, soon);

		const closed = pageSocket();
		const open = pageSocket();

		hotReload.websocket.open(closed);
		hotReload.websocket.open(open);
		hotReload.websocket.close(closed);

		writeFileSync(join(root, 'client/index.js'), 'globalThis.version = 3;\n');

		await until(() => open.send.mock.calls.length > 0);

		expect(closed.send).not.toHaveBeenCalled();
	});

	test('watching again keeps the one watcher and takes the new build options', async () => {
		const first = hotReload.watch(buildOptions, soon);
		const second = hotReload.watch({ ...buildOptions, define: { VERSION: '"again"' } }, soon);

		expect(second).toBe(first);

		await first;

		const page = pageSocket();

		hotReload.websocket.open(page);
		writeFileSync(join(root, 'client/index.js'), 'globalThis.version = VERSION;\n');

		await until(() => page.send.mock.calls.length > 0);

		expect(await Bun.file(join(root, 'client/build/index.js')).text()).toContain('again');
		expect(page.send).toHaveBeenCalledTimes(1);
	});

	test('only a change to a file the client was built from triggers a build', async () => {
		await hotReload.watch(buildOptions, soon);

		const page = pageSocket();

		hotReload.websocket.open(page);
		writeFileSync(join(root, 'client/build/extra.js'), 'x');
		writeFileSync(join(root, 'client/unused.js'), 'x');
		writeFileSync(join(root, 'server.log'), 'Built client/build');

		await delay(400);

		expect(page.send).not.toHaveBeenCalled();
	});

	test('a run of changes is one build, once they have been quiet for the wait, which a later watch may change', async () => {
		expect(HOT_RELOAD_DEBOUNCE).toBe(30_000);

		await hotReload.watch(buildOptions, { debounce: 300 });

		const page = pageSocket();
		const write = version => writeFileSync(join(root, 'client/index.js'), `globalThis.version = ${version};\n`);

		hotReload.websocket.open(page);
		// Each change inside the wait puts the build off again
		for (const version of [1, 2, 3]) {
			write(version);
			await delay(150);
		}

		expect(page.send).not.toHaveBeenCalled();
		await until(() => page.send.mock.calls.length > 0);
		await delay(400);
		expect(page.send).toHaveBeenCalledTimes(1);
		expect(await Bun.file(join(root, 'client/build/index.js')).text()).toContain('3');

		// Watching again (a hot reload of the server) joins the same watcher, with the wait it's now given
		await hotReload.watch(buildOptions, { debounce: 20 });
		write(4);
		await until(() => page.send.mock.calls.length === 2, 250);
	});
});
