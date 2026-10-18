import { join } from 'path';

import { ConflictError } from './errors';
import { serveStatic } from './serveStatic';

/**
 * Serve a single-page app: its index page, revalidated on every load (the hashed chunks it names change with each
 * build, so a cached index points at files that are gone), the built files and package assets through serveStatic, and
 * the index again for any other GET, so the client's router has every path. Paths under `api` are never answered with
 * the page: an unknown endpoint gets undefined here, and a 404 from the caller, rather than 200 and HTML. Nor is a
 * path naming a file: a chunk that is gone after a deploy is a 404, not HTML the browser refuses as a script.
 * @param {Request} request - Any incoming request
 * @param {object} [options] - Options
 * @param {string} [options.root] - The build output directory
 * @param {string} [options.api] - The prefix the page is never served under; false serves it everywhere
 * @param {object} [options.headers] - Further headers for the page, such as a Content-Security-Policy
 * @param {string[]} [options.packages] - Passed on to serveStatic
 * @returns {Promise<Response|undefined>} The page or file, or undefined
 */
export const serveApp = async (request, { root = 'client/build', api = '/api/', headers, packages } = {}) => {
	if (request.method !== 'GET' && request.method !== 'HEAD') return;

	const { pathname } = new URL(request.url);
	const page = () =>
		new Response(Bun.file(join(root, 'index.html')), {
			headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-cache', ...headers },
		});

	if (pathname === '/' || pathname === '/index.html') return page();

	const file = await serveStatic(request, { root, packages });

	if (file) return file;

	if (api && (pathname.startsWith(api) || pathname === api.replace(/\/$/, ''))) return;

	// A file that isn't there (a chunk from before the last build) is a 404, not the page under its name
	if (/\.[^/]+$/.test(pathname)) return;

	return page();
};

/**
 * Wrap a router so a thrown error becomes an answer: a body that isn't JSON answers 400, and a ValidationError (or any
 * error with a 4xx `status`) answers that status with `{ error }`, its message shown to the client, a ConflictError answers 409 with the stored record as `current`, and
 * anything else is logged and answers 500 without its details.
 * @example Bun.serve({ fetch: withErrors(router) });
 * @param {Function} router - (request, server) => Response, maybe async
 * @param {object} [options] - Options
 * @param {Function} [options.log] - Where unexpected errors go
 * @returns {Function} The wrapped router
 */
export const withErrors =
	(router, { log = console.error } = {}) =>
	async (request, server) => {
		try {
			return await router(request, server);
		} catch (error) {
			// A body that isn't JSON; a SyntaxError from anywhere else is the server's own fault
			if (error instanceof SyntaxError && /JSON/i.test(error.message)) {
				return Response.json({ error: 'Invalid JSON' }, { status: 400 });
			}
			if (error instanceof ConflictError) {
				return Response.json({ error: error.message, current: error.current }, { status: 409 });
			}
			if (Number.isInteger(error?.status) && error.status >= 400 && error.status < 500) {
				return Response.json({ error: error.message }, { status: error.status });
			}

			log(`${request.method} ${new URL(request.url).pathname} failed\n`, error);

			return new Response('Server Error', { status: 500 });
		}
	};

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Whether a request may act here. A write or a socket upgrade sent by another site's page, or through a DNS name rebound
 * to this machine, carries an Origin that isn't this host. WebSockets get no CORS protection at all, so this is the
 * check that keeps a page the browser happens to visit from attaching to one. Reads, and requests from outside a
 * browser (no Origin), pass.
 * @example if (!sameOrigin(request)) return new Response('Cross-origin request refused', { status: 403 });
 * @param {Request} request - Any incoming request
 * @returns {boolean} False for a cross-origin write or upgrade
 */
export const sameOrigin = request => {
	const guarded = !SAFE_METHODS.includes(request.method) || !!request.headers.get('upgrade');
	const origin = request.headers.get('origin');

	if (!guarded || !origin) return true;

	try {
		return new URL(origin).host === request.headers.get('host');
	} catch {
		// "null", from a sandboxed frame or a file: page, is never this host
		return false;
	}
};
