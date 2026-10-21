import { connectSocket } from './socket';

class FakeSocket extends EventTarget {
	static CONNECTING = 0;
	static OPEN = 1;
	static CLOSED = 3;
	static made = [];

	readyState = FakeSocket.CONNECTING;
	sent = [];

	constructor(url) {
		super();
		this.url = url;
		FakeSocket.made.push(this);
	}

	open() {
		this.readyState = FakeSocket.OPEN;
		this.dispatchEvent(new Event('open'));
	}

	drop() {
		this.readyState = FakeSocket.CLOSED;
		this.dispatchEvent(new Event('close'));
	}

	send(data) {
		this.sent.push(data);
	}

	close() {
		this.drop();
	}
}

describe('connectSocket', () => {
	const RealSocket = globalThis.WebSocket;
	const latest = () => FakeSocket.made.at(-1);
	let socket;

	beforeEach(() => {
		FakeSocket.made = [];
		globalThis.WebSocket = FakeSocket;
	});

	afterEach(() => {
		socket?.close();
		globalThis.WebSocket = RealSocket;
	});

	test("a path is this host's, over ws on an http page", () => {
		socket = connectSocket('/game');

		expect(latest().url).toBe(`ws://${location.host}/game`);
	});

	test('messages arrive parsed, and sending waits for nothing', () => {
		socket = connectSocket();

		const received = mock();

		socket.onMessage(received);
		expect(socket.send({ type: 'early' })).toBe(false);

		latest().open();
		latest().dispatchEvent(new MessageEvent('message', { data: '{"type":"hi"}' }));

		expect(received.mock.calls[0][0]).toEqual({ type: 'hi' });
		expect(socket.send({ type: 'join' })).toBe(true);
		expect(latest().sent).toEqual(['{"type":"join"}']);
	});

	test('a dropped connection comes back with its listeners, saying so once each way', async () => {
		const onLost = mock();
		const onRestored = mock();
		const received = mock();

		socket = connectSocket('/ws', { onLost, onRestored });
		socket.onMessage(received);
		latest().open();
		latest().drop();

		document.dispatchEvent(new Event('visibilitychange'));
		latest().drop();

		expect(onLost).toHaveBeenCalledTimes(1);

		window.dispatchEvent(new Event('online'));
		latest().open();
		latest().dispatchEvent(new MessageEvent('message', { data: 'plain' }));

		expect(onRestored).toHaveBeenCalledTimes(1);
		expect(received.mock.calls[0][0]).toBe('plain');
	});

	test('closed for good stays closed', () => {
		socket = connectSocket();
		latest().open();
		socket.close();

		window.dispatchEvent(new Event('online'));

		expect(FakeSocket.made).toHaveLength(1);
	});
});
