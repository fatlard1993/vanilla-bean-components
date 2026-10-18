import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { ConflictError, ValidationError } from './errors';
import { createStore, openDatabase } from './store';

// A db that writes nowhere, counting writes; `fail` makes the next one throw
const memoryDb = (data = { games: {} }) => {
	const db = {
		data,
		writes: 0,
		fail: false,
		async write() {
			if (db.fail) {
				db.fail = false;
				throw new Error('disk full');
			}

			db.writes++;
		},
	};

	return db;
};

describe('createStore', () => {
	const fields = {
		name: { type: 'string', required: true },
		players: { type: 'number' },
		tags: { type: 'stringArray' },
	};

	test('creates records with a generated id, only known fields, and empty values of the right kind', async () => {
		const db = memoryDb();
		const games = createStore({ db, collection: 'games', fields });
		const game = await games.create({ name: 'Chess', extra: 'dropped' });

		expect(game).toEqual({ name: 'Chess', players: '', tags: [], id: game.id });
		expect(game.id).toHaveLength(12);
		expect(db.data.games[game.id]).toBe(game);
		expect(db.writes).toBe(1);
	});

	test('no two records share a default list', async () => {
		const games = createStore({ db: memoryDb(), collection: 'games', fields });
		const a = await games.create({ name: 'a' });
		const b = await games.create({ name: 'b' });

		expect(a.tags).not.toBe(b.tags);
	});

	test('a field of the wrong shape, or a required one missing, is a ValidationError naming it', async () => {
		const games = createStore({ db: memoryDb(), collection: 'games', fields });

		await expect(games.create({ name: { nested: true } })).rejects.toThrow(new ValidationError('name: expected text'));
		await expect(games.create({ players: 2 })).rejects.toThrow(new ValidationError('name is required'));
		await expect(games.create('not an object')).rejects.toBeInstanceOf(ValidationError);
	});

	test('ids name only records the collection owns', async () => {
		const games = createStore({ db: memoryDb(), collection: 'games', fields });

		await games.create({ name: 'Chess' });

		for (const id of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', '']) {
			expect(games.has(id)).toBe(false);
			expect(games.read({ id })).toBe(false);
			expect(await games.update({ id, update: { name: 'x' } })).toBe(false);
			expect(await games.delete({ id })).toBe(false);
		}

		expect(Object.getPrototypeOf(games.data)).toBe(Object.prototype);
	});

	test('update changes only the fields it is given, checked; delete removes', async () => {
		const games = createStore({ db: memoryDb(), collection: 'games', fields });
		const { id } = await games.create({ name: 'Chess', players: 2 });

		expect(await games.update({ id, update: { players: '4', id: 'other', bogus: 1 } })).toEqual({
			name: 'Chess',
			players: 4,
			tags: [],
			id,
		});
		await expect(games.update({ id, update: { players: 'many' } })).rejects.toBeInstanceOf(ValidationError);
		expect(await games.delete({ id })).toBe(id);
		expect(games.read({ id })).toBe(false);
		expect(games.list()).toEqual([]);
	});

	test('fields as a list of names, or as defaults, store what they are given', async () => {
		const notes = createStore({ db: memoryDb({ notes: {} }), collection: 'notes', fields: ['title', 'body'] });

		expect(await notes.create({ title: 'a', body: { any: 'shape' } })).toMatchObject({
			title: 'a',
			body: { any: 'shape' },
		});
		expect(await notes.create({})).toMatchObject({ title: '', body: '' });

		const pains = createStore({
			db: memoryDb({ pains: {} }),
			collection: 'pains',
			fields: { level: 0, remedies: () => [] },
		});

		expect(await pains.create({})).toMatchObject({ level: 0, remedies: [] });
	});

	test('a change that fails to write is undone in memory too', async () => {
		const db = memoryDb();
		const games = createStore({ db, collection: 'games', fields });
		const { id } = await games.create({ name: 'Chess' });

		db.fail = true;
		await expect(games.create({ name: 'Go' })).rejects.toThrow('disk full');
		expect(games.list()).toHaveLength(1);

		db.fail = true;
		await expect(games.update({ id, update: { name: 'Checkers' } })).rejects.toThrow('disk full');
		expect(games.read({ id }).name).toBe('Chess');

		db.fail = true;
		await expect(games.delete({ id })).rejects.toThrow('disk full');
		expect(games.has(id)).toBe(true);
	});

	test('a versioned store refuses an update made against an older version, with the current record', async () => {
		const games = createStore({ db: memoryDb(), collection: 'games', fields, versioned: true });
		const { id, _v } = await games.create({ name: 'Chess' });

		expect(_v).toBe(1);
		expect((await games.update({ id, update: { name: 'Go', _v: 1 } }))._v).toBe(2);

		const stale = await games.update({ id, update: { name: 'Checkers', _v: 1 } }).catch(error => error);

		expect(stale).toBeInstanceOf(ConflictError);
		expect(stale.current.name).toBe('Go');
		expect((await games.update({ id, update: { name: 'Checkers' } }))._v).toBe(3);
	});

	test('hooks see the change, and an afterDelete that throws puts the record back', async () => {
		const seen = [];
		const games = createStore({
			db: memoryDb(),
			collection: 'games',
			fields,
			hooks: {
				beforeCreate: entry => (entry.slug = entry.name.toLowerCase()),
				beforeWrite: entries => seen.push(entries.map(entry => entry.name)),
				afterDelete: () => {
					throw new Error('still referenced');
				},
			},
		});
		const { id, slug } = await games.create({ name: 'Chess' });

		await games.update({ id, update: { name: 'Go' } });

		expect(slug).toBe('chess');
		expect(seen).toEqual([['Chess'], ['Chess', 'Go']]);
		await expect(games.delete({ id })).rejects.toThrow('still referenced');
		expect(games.has(id)).toBe(true);
	});

	test('changes take turns, so one waiting in a hook is never undone or undoes another', async () => {
		const games = createStore({
			db: memoryDb(),
			collection: 'games',
			fields,
			versioned: true,
			hooks: { beforeUpdate: () => new Promise(resolve => setTimeout(resolve, 20)) },
		});
		const { id } = await games.create({ name: 'Chess' });

		const [first, second] = await Promise.allSettled([
			games.update({ id, update: { name: 'Go', _v: 1 } }),
			games.update({ id, update: { name: 'Checkers', _v: 1 } }),
		]);

		expect(first.value.name).toBe('Go');
		expect(second.reason).toBeInstanceOf(ConflictError);

		const updating = games.update({ id, update: { players: 2 } });

		await games.delete({ id });

		expect(await updating).toMatchObject({ players: 2 });
		expect(games.has(id)).toBe(false);
	});

	test('without a collection, the whole database is the collection', async () => {
		const db = memoryDb({});
		const store = createStore({ db, fields: ['name'] });
		const { id } = await store.create({ name: 'a' });

		expect(db.data[id].name).toBe('a');
	});

	test('fields are required', () => {
		expect(() => createStore({ db: memoryDb(), collection: 'games' })).toThrow('fields is required');
	});
});

describe('openDatabase', () => {
	let dir;

	beforeEach(() => (dir = mkdtempSync(join(tmpdir(), 'openDatabase-'))));
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	test('creates the file with its default collections, and keeps what a file already holds', async () => {
		const path = join(dir, 'db.json');

		writeFileSync(path, JSON.stringify({ games: { a: { name: 'Chess' } } }));

		const db = await openDatabase({ path, defaults: { games: {}, players: {} } });

		expect(db.data).toEqual({ games: { a: { name: 'Chess' } }, players: {} });
		expect(JSON.parse(readFileSync(path, 'utf8')).players).toEqual({});
	});

	test('writes through a symlink to its target, and names the file it cannot read', async () => {
		const target = join(dir, 'real.json');
		const link = join(dir, 'link.json');

		writeFileSync(target, '{}');
		symlinkSync(target, link);

		const db = await openDatabase({ path: link, defaults: { games: {} } });

		await createStore({ db, collection: 'games', fields: ['name'] }).create({ name: 'Go' });

		expect(Object.values(JSON.parse(readFileSync(target, 'utf8')).games)[0].name).toBe('Go');

		writeFileSync(target, '{ truncated');
		await expect(openDatabase({ path: link })).rejects.toThrow(`Could not read the database at ${target}`);
	});

	test('concurrent changes all land', async () => {
		const path = join(dir, 'db.json');
		const db = await openDatabase({ path, defaults: { games: {} } });
		const games = createStore({ db, collection: 'games', fields: ['name'] });

		await Promise.all(Array.from({ length: 20 }, (_, index) => games.create({ name: `game ${index}` })));

		expect(Object.keys(JSON.parse(readFileSync(path, 'utf8')).games)).toHaveLength(20);
	});
});
