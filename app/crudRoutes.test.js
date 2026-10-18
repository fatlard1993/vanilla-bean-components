import { crudRoutes } from './crudRoutes';
import { withErrors } from './serveApp';
import { createStore } from './store';

describe('crudRoutes', () => {
	// Server code answers with Bun's own Response, which the DOM test setup replaces
	const DomResponse = globalThis.Response;

	beforeAll(async () => (globalThis.Response = (await Bun.fetch('data:,')).constructor));
	afterAll(() => (globalThis.Response = DomResponse));

	let games;
	let routes;

	beforeEach(() => {
		games = createStore({
			db: { data: { games: {} }, write: async () => {} },
			collection: 'games',
			fields: { name: { type: 'string', required: true } },
		});
		routes = withErrors(crudRoutes('/api/games', games));
	});

	const call = (method, path, body) =>
		routes(
			new Request(`http://localhost${path}`, {
				method,
				...(body !== undefined && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
			}),
		);

	test('create, read, list, update and delete', async () => {
		const created = await call('POST', '/api/games', { name: 'Chess' });
		const { id } = await created.json();

		expect(created.status).toBe(201);
		expect(await (await call('GET', `/api/games/${id}`)).json()).toEqual({ name: 'Chess', id });
		expect(await (await call('GET', '/api/games')).json()).toEqual({ [id]: { name: 'Chess', id } });
		expect(await (await call('PATCH', `/api/games/${id}`, { name: 'Go' })).json()).toEqual({ name: 'Go', id });
		expect((await call('DELETE', `/api/games/${id}`)).status).toBe(204);
		expect((await call('GET', `/api/games/${id}`)).status).toBe(404);
		expect((await call('DELETE', `/api/games/${id}`)).status).toBe(404);
	});

	test('a search param never names a record', async () => {
		await call('POST', '/api/games', { name: 'Chess' });

		expect(Object.keys(await (await call('GET', '/api/games?id=toString')).json())).toHaveLength(1);
		expect((await call('GET', '/api/games/missing?id=toString')).status).toBe(404);
		expect((await call('GET', '/api/games/__proto__')).status).toBe(404);
		expect((await call('PATCH', '/api/games/constructor', { name: 'x' })).status).toBe(404);
	});

	test('a malformed body, or one that fails its fields, answers 400', async () => {
		expect((await call('POST', '/api/games', '{ not json')).status).toBe(400);

		const missing = await call('POST', '/api/games', {});

		expect(missing.status).toBe(400);
		expect(await missing.json()).toEqual({ error: 'name is required' });
	});

	test('anything else is left for the next route', async () => {
		expect(await call('GET', '/api/players')).toBeUndefined();
		expect(await call('GET', '/api/games/1/players')).toBeUndefined();
	});

	test('list: true answers an array', async () => {
		await games.create({ name: 'Chess' });

		const listed = await crudRoutes('/api/games', games, { list: true })(new Request('http://localhost/api/games'));

		expect(await listed.json()).toEqual([expect.objectContaining({ name: 'Chess' })]);
	});
});
