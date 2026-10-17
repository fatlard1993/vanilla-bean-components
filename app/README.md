# app

The server side of a VBC app on Bun: build the client, reload open pages while you work, serve the built files and the package files the components load at runtime, and match requests to routes.

It's a separate entry point, so none of it reaches a client bundle.

```js
import { buildClient, hotReload, requestMatch, serveStatic } from '@vanilla-bean/components/app';
```

## A whole server

```js
// server/index.js, run with `bun --hot server/index.js` in development
import { hotReload, requestMatch, serveStatic } from '@vanilla-bean/components/app';

const server = Bun.serve({
	port: 8080,
	async fetch(request) {
		if (hotReload.upgrade(request, server)) return;

		const game = requestMatch('GET', '/api/games/:id', request);

		if (game) return Response.json(await loadGame(game.id));

		return (await serveStatic(request)) ?? new Response('Not Found', { status: 404 });
	},
	websocket: hotReload.websocket,
});

if (process.env.NODE_ENV === 'development') await hotReload.watch();
```

```js
// client/index.js
import '@vanilla-bean/components/app/reloadOnBuild';
```

```js
// client/build.js, run by `bun run build`
import { buildClient } from '@vanilla-bean/components/app';

const { success } = await buildClient();

if (!success) process.exit(1);
```

## `buildClient(options?)`

One `Bun.build` of the client. It defaults to `client/index.html` → `client/build`, and any other `Bun.build` option passes through.

`process.env.NODE_ENV` is defined in the bundle, so `if (process.env.NODE_ENV === 'development')` blocks drop out of a production build. A build is a production build unless it's given `production: false`, whatever `NODE_ENV` the shell has; `hotReload.watch` builds for development. Production builds minify. Development builds write source maps.

## `hotReload`

- **`watch(buildOptions?, { debounce? }?)`** builds once, then rebuilds whenever a file under the working directory that the last build read changes, and tells every connected page to reload. Server code, logs and databases never trigger a rebuild, because the client wasn't built from them.
- **`upgrade(request, server)`** takes a page's reload socket at `/hotReload`, and only while watching. It returns true when it took the request, and then `fetch` returns nothing.
- **`websocket`** is `{ open, close }` for `Bun.serve`. An app with its own sockets calls `hotReload.websocket.open(socket)` and `hotReload.websocket.close(socket)` from its handlers. Sockets it didn't take are ignored.
- **`rebuild()`** rebuilds now and reloads connected pages, for a dev console's build command. It does nothing while not watching.
- **`stop()`** closes the watcher.

The watcher builds inside the server process, so it ends with the server. `bun --hot` re-runs the server module on each change, and `watch` keeps its one watcher and its connected pages through that, taking the newest build options for the next rebuild.

`@vanilla-bean/components/app/reloadOnBuild` is the page's side. In a development build it connects, reloads on each build, and when the server restarts it reconnects and reloads. In a production build it's empty.

## `serveStatic(request, { root?, packages? }?)`

Answers GET and HEAD from `root` (default `client/build`), with `index.html` for a directory. It returns `undefined` when there's no file, so it chains with `??`.

`Page` links the Font Awesome and kode-mono stylesheets, and `theme.code` loads the syntax font, all by package path. `serveStatic` serves those packages, found by module resolution from the library, wherever the package manager put them. A relative href asked for from a deep route (`/games/12/@fortawesome/...`) is matched too. Add packages of your own with `packages: ['leaflet']`. Nothing else in `node_modules` is reachable.

A request never gets out of its root, however it's encoded, and never gets a dotfile or a nested `node_modules`.

## `requestMatch(method, pattern, request)`

```js
requestMatch('GET', '/games/:id', request); // → { id: '12', ...searchParams }, or false
```

It matches the whole path, so `/games/:id` doesn't match `/games/12/join`. Pattern characters are literal, and segments are decoded.

It's the one piece that runs in a browser too. Code shared with the client imports it from `@vanilla-bean/components/app/requestMatch`, which brings none of the server code along.
