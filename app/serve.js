import { hotReload } from './hotReload';
import { sameOrigin, withErrors } from './serveApp';

/**
 * Start an app's server: a `Bun.serve` that refuses cross-origin writes and sockets, takes the page's hot reload socket,
 * turns a thrown error into an answer (withErrors), and answers 404 for anything the router leaves. In development it
 * watches the client too. Sockets the app upgrades itself reach `websocket`; the hot reload ones never do.
 * @example await serve({ port: 8033, router });
 * @param {object} options - Any other `Bun.serve` option (hostname, tls, maxRequestBodySize, …) passes through
 * @param {Function} options.router - (request, server) => Response or undefined, maybe async
 * @param {object} [options.websocket] - Handlers and settings for the app's own sockets
 * @param {object} [options.build] - Passed to hotReload.watch in development
 * @returns {Promise<object>} The Bun server
 */
export const serve = async ({ router, websocket = {}, build, ...options }) => {
	const answer = withErrors(router);
	const own =
		handler =>
		(socket, ...rest) =>
			socket.data?.hotReload ? hotReload.websocket[handler]?.(socket) : websocket[handler]?.(socket, ...rest);

	let server;

	try {
		server = Bun.serve({
			...options,
			async fetch(request, server) {
				if (!sameOrigin(request)) return new Response('Cross-origin request refused', { status: 403 });
				if (hotReload.upgrade(request, server)) return;

				return (await answer(request, server)) ?? new Response('Not Found', { status: 404 });
			},
			websocket: { ...websocket, open: own('open'), message: own('message'), close: own('close') },
		});
	} catch (error) {
		if (error.code === 'EADDRINUSE') throw new Error(`Port ${options.port} is already in use`, { cause: error });

		throw error;
	}

	console.log(`Listening on ${options.tls ? 'https' : 'http'}://${server.hostname}:${server.port}`);

	if (process.env.NODE_ENV === 'development') await hotReload.watch(build);

	return server;
};
