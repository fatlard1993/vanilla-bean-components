import { realpathSync } from 'fs';

import { nanoid } from 'nanoid';

import { ConflictError } from './errors';
import { isSafeKey, normalizeFields, validateFields } from './fields';

/**
 * Open a lowdb JSON file, filling in any top-level collection it lacks. A symlinked path is followed, so the write
 * replaces the target rather than the link, and a file that won't parse fails naming the file. lowdb writes through a
 * temporary file and a rename, one write at a time, so nothing more is needed for safe writes.
 * @param {object} options - Options
 * @param {string} options.path - The JSON file
 * @param {object} [options.defaults] - Collections to start with, e.g. `{ games: {} }`
 * @returns {Promise<object>} The lowdb instance
 */
export const openDatabase = async ({ path, defaults = {} }) => {
	// lowdb is the app's dependency, loaded only by an app that opens a database here; its exports map is beyond the
	// import resolver
	// eslint-disable-next-line import/no-unresolved
	const { Low } = await import('lowdb');
	// eslint-disable-next-line import/no-unresolved
	const { JSONFile } = await import('lowdb/node');

	let resolvedPath = path;

	try {
		resolvedPath = realpathSync(path);
	} catch {
		// Not there yet (a first run), so it's created where it was asked for
	}

	const db = new Low(new JSONFile(resolvedPath), structuredClone(defaults));

	try {
		await db.read();
	} catch (error) {
		throw new Error(`Could not read the database at ${resolvedPath}: ${error.message}`, { cause: error });
	}

	db.data = { ...structuredClone(defaults), ...db.data };
	db.path = resolvedPath;

	await db.write();

	return db;
};

/**
 * One collection of records, keyed by a generated id, in a lowdb database (or anything with `data` and `write()`).
 * Only fields it knows are stored, checked against their types; ids name only the collection's own records; and a
 * change that fails to write is undone in memory too.
 * @param {object} options - Options
 * @param {object} options.db - The database: a lowdb instance from openDatabase, or `{ data, write() }`
 * @param {string} [options.collection] - Key under `db.data`; without one, `db.data` is the collection
 * @param {Array<string>|object} options.fields - The fields records have; see normalizeFields
 * @param {boolean} [options.versioned] - Number each record's versions in `_v`, and refuse an update made
 *   against an older one with a ConflictError
 * @param {object} [options.hooks] - `beforeCreate(entry, data)`, `beforeUpdate(update, current)`,
 *   `afterDelete(id, options, entry)` (throwing puts the record back), and `beforeWrite(entries)`, called with the
 *   records a change touches (for an update, the old and the new) just before the write
 * @returns {object} The store: has, read, list, create, update, delete
 */
export const createStore = ({ db, collection, fields, versioned = false, hooks = {} }) => {
	if (!fields) throw new Error(`createStore${collection ? ` (${collection})` : ''}: fields is required`);

	const spec = normalizeFields(fields);
	const data = () => (collection ? db.data[collection] : db.data);

	// The write, or putting things back as they were if it fails
	const commit = async (touched, undo) => {
		try {
			await hooks.beforeWrite?.(touched);
			await db.write();
		} catch (error) {
			undo();
			throw error;
		}
	};

	return {
		get data() {
			return data();
		},

		/**
		 * @param {string} id - A record id
		 * @returns {boolean} Whether the collection holds a record by that id, as its own
		 */
		has(id) {
			return isSafeKey(id) && Object.hasOwn(data(), id);
		},

		/**
		 * @param {object} [options] - Options
		 * @param {string} [options.id] - One record's id
		 * @returns {object|false} That record, or false; without an id, the whole collection by id
		 */
		read({ id } = {}) {
			if (id !== undefined) return this.has(id) ? data()[id] : false;

			return data();
		},

		/**
		 * @returns {Array<object>} Every record
		 */
		list() {
			return Object.values(data());
		},

		/**
		 * @param {object} body - The new record's fields
		 * @returns {Promise<object>} The stored record, with its id
		 */
		async create(body) {
			const entry = validateFields(spec, body);
			let id = nanoid(12);

			while (this.has(id)) id = nanoid(12);

			Object.assign(entry, { id }, versioned && { _v: 1 });

			await hooks.beforeCreate?.(entry, body);

			data()[id] = entry;
			await commit([entry], () => delete data()[id]);

			return entry;
		},

		/**
		 * @param {object} options - Options
		 * @param {string} options.id - The record's id
		 * @param {object} options.update - Fields to change; a versioned store reads the version it was made against from `_v`
		 * @returns {Promise<object|false>} The updated record, or false when there is none by that id
		 */
		async update({ id, update }) {
			if (!this.has(id)) return false;

			const previous = data()[id];

			if (versioned && update?._v !== undefined && previous._v !== undefined && update._v !== previous._v) {
				throw new ConflictError(previous);
			}

			const changes = validateFields(spec, update, { partial: true });

			await hooks.beforeUpdate?.(changes, previous);

			const next = { ...previous, ...changes, ...(versioned && { _v: (previous._v ?? 0) + 1 }) };

			data()[id] = next;
			await commit([previous, next], () => (data()[id] = previous));

			return next;
		},

		/**
		 * @param {object} options - Options, passed on to afterDelete
		 * @param {string} options.id - The record's id
		 * @returns {Promise<string|false>} The removed id, or false when there is none by that id
		 */
		async delete({ id, ...options }) {
			if (!this.has(id)) return false;

			const entry = data()[id];
			const putBack = () => (data()[id] = entry);

			delete data()[id];

			try {
				await hooks.afterDelete?.(id, options, entry);
			} catch (error) {
				putBack();
				throw error;
			}

			await commit([entry], putBack);

			return id;
		},
	};
};
