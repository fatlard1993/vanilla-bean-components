import { ValidationError } from './errors';
import { serve } from './serve';

describe('serve', () => {
	const DomResponse = globalThis.Response;
	const nodeEnv = process.env.NODE_ENV;
	let server;

	beforeAll(async () => {
		process.env.NODE_ENV = 'production';
		globalThis.Response = (await Bun.fetch('data:,')).constructor;
	});

	afterAll(() => {
		process.env.NODE_ENV = nodeEnv;
		globalThis.Response = DomResponse;
	});

	afterEach(() => server?.stop(true));

	const start = options => serve({ port: 0, ...options }).then(started => (server = started));
	const url = path => `http://localhost:${server.port}${path}`;

	test("the router's answer comes back, and what it leaves is a 404", async () => {
		await start({ router: request => (new URL(request.url).pathname === '/hi' ? new Response('hi') : undefined) });

		expect(await (await Bun.fetch(url('/hi'))).text()).toBe('hi');
		expect((await Bun.fetch(url('/nope'))).status).toBe(404);
	});

	test('a write from another site never reaches the router', async () => {
		const router = mock(() => new Response('ok'));

		await start({ router });

		const refused = await Bun.fetch(url('/'), { method: 'POST', headers: { origin: 'http://evil.test' } });

		expect(refused.status).toBe(403);
		expect(router).not.toHaveBeenCalled();
	});

	test('a thrown error becomes an answer', async () => {
		await start({
			router: () => {
				throw new ValidationError('name is required');
			},
		});

		const answer = await Bun.fetch(url('/'));

		expect(answer.status).toBe(400);
		expect(await answer.json()).toEqual({ error: 'name is required' });
	});

	test("the app's own sockets reach its handlers", async () => {
		const received = Promise.withResolvers();

		await start({
			router: (request, server) => server.upgrade(request, { data: { route: 'echo' } }) || undefined,
			websocket: { message: (socket, message) => received.resolve([socket.data.route, String(message)]) },
		});

		// happy-dom stands in for WebSocket here; a separate Bun has the real one
		const client = Bun.spawn([
			process.execPath,
			'-e',
			`const socket = new WebSocket('ws://localhost:${server.port}/'); socket.onopen = () => socket.send('hello');`,
		]);

		expect(await received.promise).toEqual(['echo', 'hello']);

		client.kill();
	});

	test('a port already taken says so', async () => {
		await start({ router: () => new Response('ok') });

		expect(serve({ port: server.port, router: () => undefined })).rejects.toThrow(
			`Port ${server.port} is already in use`,
		);
	});
});
