import { resource } from '@vanilla-bean/hypertether';

const MAX_RETRIES = 3;

/**
 * The fields of `changes` the stored record holds otherwise; `_v` is never one.
 * @param {object} changes - What was sent
 * @param {object} current - The stored record
 * @returns {Array<object>} `{ key, ours, theirs }` for each
 */
const differing = (changes, current) =>
	Object.keys(changes)
		.filter(key => key !== '_v' && JSON.stringify(changes[key]) !== JSON.stringify(current?.[key]))
		.map(key => ({ key, ours: changes[key], theirs: current?.[key] }));

/**
 * The client half of crudRoutes: hypertether's `resource` for a collection served by crudRoutes, with an update that
 * understands a versioned store. An update sent with a `_v` older than the stored record's answers 409 with `_conflict`
 * and the stored record as `current`; that comes back as the result's `conflict` rather than a bare failure. A
 * conflict in which every field sent already holds what was sent is sent again over the stored version, and
 * `onConflict` may answer the rest with the fields to send instead (sent over the stored version), or with nothing to
 * leave the conflict for the caller. Every other answer, a 404's `{ error: 'Not found' }` included, is hypertether's
 * result as it came, `failureReason` reading it.
 * @example
 * const games = crudResource('/api/games');
 * const { conflict, body } = await games.update(game.id, { body: { name, _v: game._v } });
 * if (conflict) notify(`${conflict.fields.map(({ key }) => key).join(', ')} changed meanwhile`);
 * @param {string} path - Where crudRoutes serves the collection, e.g. `/api/games`
 * @param {object} [options] - Passed on to hypertether's `resource`: `apiId`, `invalidates`, and options for the reads
 * @returns {object} `list(options)`, `read(id, options)`, `create(options)`, `update(id, options)` and
 *   `delete(id, options)`, each resolving to a hypertether result; update takes `onConflict(conflict)` too
 */
export const crudResource = (path, options) => {
	const requests = resource(path, options);

	const attempt = async (id, { onConflict, ...options }, retries) => {
		const result = await requests.update(id, options);

		if (result.response?.status !== 409 || !result.body?._conflict) return result;

		const changes = options.body ?? {};
		const { current } = result.body;
		const conflict = { current, changes, fields: differing(changes, current) };

		if (retries < MAX_RETRIES) {
			const next = conflict.fields.length ? await onConflict?.(conflict) : changes;

			if (next) return attempt(id, { onConflict, ...options, body: { ...next, _v: current._v } }, retries + 1);
		}

		return { ...result, conflict };
	};

	return { ...requests, update: (id, options = {}) => attempt(id, options, 0) };
};
