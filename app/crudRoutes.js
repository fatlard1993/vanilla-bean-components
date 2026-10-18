import { requestMatch } from './requestMatch';

/**
 * The REST routes for one store: list and create at `path`, read, update and delete at `path/:id`. The id comes only
 * from the path; a `?id=` search param never names a record. A route answers undefined when it doesn't match, so
 * routers chain with `??`.
 * @example const gamesRoutes = crudRoutes('/api/games', games);
 * @param {string} path - Where the collection lives, e.g. `/api/games`
 * @param {object} store - From createStore, or anything with read, create, update and delete
 * @param {object} [options] - Options
 * @param {boolean} [options.list] - GET `path` answers an array rather than the records by id
 * @returns {Function} (request) => Promise<Response|undefined>
 */
export const crudRoutes =
	(path, store, { list = false } = {}) =>
	async request => {
		if (requestMatch('GET', path, request)) return Response.json(list ? store.list() : store.read());

		if (requestMatch('POST', path, request)) {
			return Response.json(await store.create(await request.json()), { status: 201 });
		}

		const one = method => {
			const match = requestMatch(method, `${path}/:id`, request);

			return match && { id: match.id };
		};

		let match;

		if ((match = one('GET'))) {
			const entry = store.read(match);

			return entry ? Response.json(entry) : new Response('Not Found', { status: 404 });
		}

		if ((match = one('PATCH')) || (match = one('PUT'))) {
			const entry = await store.update({ ...match, update: await request.json() });

			return entry ? Response.json(entry) : new Response('Not Found', { status: 404 });
		}

		// Search params reach delete as its options (afterDelete reads them), with the id still the path's
		match = requestMatch('DELETE', `${path}/:id`, request);
		if (match) return new Response(null, { status: (await store.delete(match)) ? 204 : 404 });
	};
