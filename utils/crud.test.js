import { clearCache, failureReason } from '@vanilla-bean/hypertether';

import { crudRoutes } from '../app/crudRoutes';
import { serve } from '../app/serve';
import { createStore } from '../app/store';

import { crudResource } from './crud';

describe('crudResource', () => {
	// The server answers with Bun's own Response, and the client fetches with Bun's own fetch, not the DOM test setup's
	const DomResponse = globalThis.Response;
	const domFetch = globalThis.fetch;
	const nodeEnv = process.env.NODE_ENV;
	let server;
	let store;
	let games;

	beforeAll(async () => {
		process.env.NODE_ENV = 'production';
		globalThis.Response = (await Bun.fetch('data:,')).constructor;
		// Bun's fetch refuses the DOM's AbortSignal, and nothing here aborts
		globalThis.fetch = (url, { signal, ...init } = {}) => Bun.fetch(url, init);

		// Each test's own store, behind the one server
		server = await serve({ port: 0, router: request => crudRoutes('/api/games', store)(request) });
	});

	afterAll(() => {
		server?.stop(true);
		process.env.NODE_ENV = nodeEnv;
		globalThis.Response = DomResponse;
		globalThis.fetch = domFetch;
	});

	beforeEach(() => {
		clearCache();
		store = createStore({
			db: { data: {}, write: async () => {} },
			fields: { name: { type: 'string', required: true }, players: { type: 'number', default: 0 } },
			versioned: true,
		});
		games = crudResource(`http://localhost:${server.port}/api/games`);
	});

	test('create, read, list, update and delete', async () => {
		const created = await games.create({ body: { name: 'Chess' } });
		const { id } = created.body;

		expect(created.response.status).toBe(201);
		expect(created.body).toEqual({ name: 'Chess', players: 0, id, _v: 1 });
		expect((await games.read(id)).body).toEqual(created.body);
		expect((await games.list()).body).toEqual({ [id]: created.body });

		const updated = await games.update(id, { body: { name: 'Go', _v: 1 } });

		expect(updated.status).toBe('success');
		expect(updated.conflict).toBeUndefined();
		expect(updated.body).toEqual({ name: 'Go', players: 0, id, _v: 2 });
		expect((await games.list()).body[id].name).toBe('Go');

		expect((await games.delete(id)).response.status).toBe(204);
		expect(store.has(id)).toBe(false);
	});

	test('a missing record answers with why', async () => {
		for (const missing of [
			await games.read('missing'),
			await games.update('missing', { body: { name: 'Go' } }),
			await games.delete('missing'),
		]) {
			expect(missing.status).toBe('error');
			expect(missing.response.status).toBe(404);
			expect(failureReason(missing)).toBe('Not found');
		}
	});

	test('an update made against an older version comes back as a conflict carrying the stored record', async () => {
		const { id } = (await games.create({ body: { name: 'Chess' } })).body;

		await store.update({ id, update: { name: 'Go', _v: 1 } });

		const stale = await games.update(id, { body: { name: 'Checkers', _v: 1 } });

		expect(stale.status).toBe('error');
		expect(stale.response.status).toBe(409);
		expect(stale.conflict).toEqual({
			current: { name: 'Go', players: 0, id, _v: 2 },
			changes: { name: 'Checkers', _v: 1 },
			fields: [{ key: 'name', ours: 'Checkers', theirs: 'Go' }],
		});
		expect(store.read({ id }).name).toBe('Go');
	});

	test('onConflict answers a conflict with what to send over the stored version', async () => {
		const { id } = (await games.create({ body: { name: 'Chess' } })).body;

		await store.update({ id, update: { players: 4 } });

		const onConflict = mock(({ changes }) => changes);
		const resent = await games.update(id, { body: { players: 2, _v: 1 }, onConflict });

		expect(onConflict).toHaveBeenCalledTimes(1);
		expect(resent.status).toBe('success');
		expect(resent.body).toEqual({ name: 'Chess', players: 2, id, _v: 3 });
	});

	test('onConflict answering nothing leaves the conflict for the caller', async () => {
		const { id } = (await games.create({ body: { name: 'Chess' } })).body;

		await store.update({ id, update: { name: 'Go' } });

		const kept = await games.update(id, { body: { name: 'Checkers', _v: 1 }, onConflict: () => {} });

		expect(kept.conflict.current.name).toBe('Go');
		expect(store.read({ id })).toEqual({ name: 'Go', players: 0, id, _v: 2 });
	});

	test('a conflict over fields that already hold what was sent is sent again over the stored version', async () => {
		const { id } = (await games.create({ body: { name: 'Chess' } })).body;

		await store.update({ id, update: { name: 'Go' } });

		const onConflict = mock();
		const same = await games.update(id, { body: { name: 'Go', _v: 1 }, onConflict });

		expect(onConflict).not.toHaveBeenCalled();
		expect(same.status).toBe('success');
		expect(same.body).toEqual({ name: 'Go', players: 0, id, _v: 3 });
	});

	test('a conflict that keeps coming back is given up on', async () => {
		const { id } = (await games.create({ body: { name: 'Chess' } })).body;

		await store.update({ id, update: { name: 'Go' } });

		// Another writer lands each time this one tries again
		const onConflict = mock(async ({ current }) => {
			await store.update({ id, update: { players: current._v } });

			return { name: 'Checkers' };
		});
		const given = await games.update(id, { body: { name: 'Checkers', _v: 1 }, onConflict });

		expect(onConflict).toHaveBeenCalledTimes(3);
		expect(given.response.status).toBe(409);
		expect(given.conflict.current.name).toBe('Go');
	});
});
