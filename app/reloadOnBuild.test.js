import { HOT_RELOAD_PATH } from './hotReloadPath';

class FakeSocket extends EventTarget {
	static CONNECTING = 0;
	static OPEN = 1;
	static CLOSED = 3;
	static made = [];

	readyState = FakeSocket.CONNECTING;

	constructor(url) {
		super();
		this.url = url;
		FakeSocket.made.push(this);
	}

	open() {
		this.readyState = FakeSocket.OPEN;
		this.dispatchEvent(new Event('open'));
	}

	message(data) {
		this.dispatchEvent(new MessageEvent('message', { data }));
	}

	close() {
		if (this.readyState === FakeSocket.CLOSED) return;

		this.readyState = FakeSocket.CLOSED;
		this.dispatchEvent(new Event('close'));
	}
}

describe('reloadOnBuild', () => {
	const RealSocket = globalThis.WebSocket;
	const latest = () => FakeSocket.made.at(-1);
	let socket;
	let reloadOnBuild;

	beforeAll(async () => {
		// Imported behind the fake: under NODE_ENV=development the module connects as it loads
		globalThis.WebSocket = FakeSocket;
		({ reloadOnBuild } = await import('./reloadOnBuild'));
	});

	beforeEach(() => {
		FakeSocket.made = [];
		globalThis.WebSocket = FakeSocket;
	});

	afterEach(() => {
		socket?.close();
		globalThis.WebSocket = RealSocket;
	});

	test('connects to the hot reload path, and reloads on a build', () => {
		const reload = mock();
		socket = reloadOnBuild({ reload });

		expect(latest().url).toBe(`ws://${location.host}${HOT_RELOAD_PATH}`);

		latest().open();
		latest().message('something else');
		expect(reload).not.toHaveBeenCalled();

		latest().message('hotReload');
		expect(reload).toHaveBeenCalledTimes(1);
	});

	test('a server that restarts reloads the page once it is back', async () => {
		const reload = mock();
		socket = reloadOnBuild({ reload });

		latest().open();
		latest().close();
		expect(reload).not.toHaveBeenCalled();

		await Bun.sleep(1100);
		expect(FakeSocket.made).toHaveLength(2);

		latest().open();
		expect(reload).toHaveBeenCalledTimes(1);
	});

	test('a page that never connected is not retried', async () => {
		socket = reloadOnBuild({ reload: mock() });

		latest().close();
		await Bun.sleep(1100);

		expect(FakeSocket.made).toHaveLength(1);
	});
});
