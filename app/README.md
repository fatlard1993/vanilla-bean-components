# app

The server side of a VBC app on Bun: build the client, reload open pages while you work, serve the page and the files the components load at runtime, match requests to routes, keep records in a JSON file, and run the app as a background service.

It's a separate entry point, so none of it reaches a client bundle.

```js
import { buildClient, createStore, crudRoutes, hotReload, serveApp } from '@vanilla-bean/components/app';
```

## A whole server

```js
// server/index.js, run with `bun --hot server/index.js` in development
import {
	createStore,
	crudRoutes,
	devConsole,
	handleExit,
	openDatabase,
	serve,
	serveApp,
} from '@vanilla-bean/components/app';

handleExit();

const db = await openDatabase({ path: `${process.env.HOME}/.games.json`, defaults: { games: {} } });
const games = createStore({ db, collection: 'games', fields: { name: { type: 'string', required: true } } });
const gamesRoutes = crudRoutes('/api/games', games);

await serve({
	port: 8080,
	router: async request => (await gamesRoutes(request)) ?? serveApp(request),
});

devConsole();
```

```js
// client/index.js
import '@vanilla-bean/components/app/reloadOnBuild';
```

```json
"build": "vbc-build"
```

## `buildClient(options?)`

One `Bun.build` of the client. `vbc-build` runs it with the defaults and exits non-zero when it fails; an app with options of its own calls `buildClient` from a script. It defaults to `client/index.html` → `client/build`, and any other `Bun.build` option passes through.

`process.env.NODE_ENV` is defined in the bundle, so `if (process.env.NODE_ENV === 'development')` blocks drop out of a production build. A build is a production build unless it's given `production: false`, whatever `NODE_ENV` the shell has; `hotReload.watch` builds for development. Production builds minify. Development builds write source maps.

The page names its chunks from the root (`publicPath: '/'`), so a page opened at a deep route (`/games/12`) still finds them. An app served under a path prefix passes `publicPath: ''` to make them relative again.

The bundler hashes a linked `manifest.json` and leaves the paths inside it as written, so `buildClient` copies each file its `icons` and `screenshots` name from beside the page into the build at that path. A missing file is skipped.

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

## Records in a JSON file

For an app whose data fits in memory: no database server, nothing to migrate, and the file travels with the user. lowdb holds it (the app depends on `lowdb` itself) and writes through a temporary file and a rename, one write at a time.

### `openDatabase({ path, defaults? })`

Opens the file, creating it with `defaults` (its collections, e.g. `{ games: {}, players: {} }`) and filling in any collection an older file lacks. A symlinked path is followed, so a dotfiles link keeps working, and a file that won't parse fails naming the file.

### `createStore({ db, collection?, fields, versioned?, hooks? })`

One collection, keyed by generated ids. `db` is from `openDatabase`, or anything with `data` and `write()`; without `collection`, `db.data` is the collection.

```js
const games = createStore({
	db,
	collection: 'games',
	fields: {
		name: { type: 'string', required: true },
		players: { type: 'number' },
		tags: { type: 'stringArray' },
		rules: { type: 'object', default: () => ({}) },
	},
});

await games.create({ name: 'Chess', players: '2' }); // → { name: 'Chess', players: 2, tags: [], rules: {}, id: 'h3k…' }
games.read({ id }); // the record, or false
games.read(); // every record, by id
games.list(); // every record, as an array
await games.update({ id, update: { players: 4 } }); // the updated record, or false
await games.delete({ id }); // the id, or false
```

- **Fields are the door.** Only known fields are stored; anything else in a body is dropped. A field's `type` parses what arrives and refuses the wrong shape with a `ValidationError` naming the field. The types are `string` (a number is taken as text), `number` (`''` is unset; a numeric string is taken), `boolean`, `stringArray`, `object`, `any`, or an object of your own with `parse(value)` and `empty()`. A field left out of a create gets its `default` (a function default is called per record) or its type's empty value. `required` refuses a create without the field, or with it empty. Shorthands: a list of names (stored as given, `''` when missing) or a map of name to default value.
- **Ids are the collection's own.** An id never names something every object inherits (`toString`) or reaches the prototype (`__proto__`): `has`, `read`, `update` and `delete` treat those as not there.
- **Memory never runs ahead of the file.** A create, update or delete whose write fails is undone before the error reaches the caller.
- **`versioned: true`** numbers each record's versions in `_v`. An update carrying an older `_v` throws a `ConflictError` holding the stored record as `current`, so two people editing one record don't silently overwrite each other. An update that leaves `_v` out isn't checked, so a client that should be guarded must send it. Changes to a store take turns, so a hook that awaits never lets another change slip in between.
- **`hooks`**: `beforeCreate(entry, body)` and `beforeUpdate(changes, current)` can amend or refuse; `afterDelete(id, options, entry)` runs with the record gone, and throwing puts it back (for a delete that would orphan something); `beforeWrite(entries)` sees the records a change touches (for an update, the old and the new) just before the write.

### `crudRoutes(path, store, { list? }?)`

The REST routes for a store: `GET path` (every record by id, or an array with `list: true`), `POST path` (201 and the record), and `GET`, `PATCH` (or `PUT`) and `DELETE` at `path/:id` (404 for no such record). The id comes only from the path: a `?id=` search param never names a record. Search params do reach `delete` as its options, for `afterDelete`. It answers `undefined` for anything else, so routers chain with `??`.

## Serving an app

### `serve({ router, websocket?, build?, ...options })`

Starts the server with what every app's server repeats. Anything else `Bun.serve` takes (`hostname`, `tls`, `maxRequestBodySize`, …) passes through.

- A write or socket from another site is refused before the router sees it (`sameOrigin`).
- A thrown error becomes an answer (`withErrors`), and anything the router leaves is a 404.
- The page's hot reload socket is taken; in development the client is watched, with `build` as its build options.
- Sockets the router upgrades itself (`server.upgrade(request, { data })`) reach `websocket`'s `open`, `message` and `close`; the hot reload ones never do. `websocket`'s settings (`perMessageDeflate`, …) pass through.
- A port already in use fails saying so.

It resolves to the Bun server.

### `handleExit({ flush?, survive? }?)`

How the process ends. Ctrl+C exits 130 and a stop request (a service manager, `kill`) exits 0. An uncaught error or unhandled rejection is logged, then exits 99 or 1. `flush` is awaited before any of them, for writes still pending; `survive: true` keeps the process running after an uncaught error, for one whose children must outlive it. Calling it again, as `bun --hot` does, only replaces the options.

### `devConsole(handle?)`

Commands typed into the dev server's terminal, in development only: `b` rebuilds the client and reloads its pages, `stop` ends the server, and any other line goes to `handle(line)`. A command that throws is logged and the console keeps reading.

### `serveApp(request, { root?, api?, headers?, packages? }?)`

The page, the built files, and the page again for any other GET so the client's router owns every path. The page is sent `cache-control: no-cache`: the chunks it names are hashed and change with each build, so a cached page points at files that are gone. Paths under `api` (default `/api/`) are never answered with the page: an unknown endpoint gets `undefined` here, then a 404, rather than 200 and HTML. `headers` go on the page, for a Content-Security-Policy. Built files and package assets come through `serveStatic`.

### `withErrors(router, { log? }?)`

Wraps a router so a thrown error becomes an answer. Malformed JSON answers 400. A `ValidationError`, or any error with a 4xx `status`, answers that status with `{ error: message }`. A `ConflictError` answers 409 with `{ error, _conflict: true, current }`. Anything else is logged and answers 500, without its details.

### `sameOrigin(request)`

False for a write or a socket upgrade whose Origin isn't this host: one sent by another site's page, or through a DNS name rebound to this machine. WebSockets get no CORS protection at all, so this is the check that keeps a page the browser happens to visit from attaching to the app. Reads, and clients outside a browser (no Origin), pass. Behind a proxy, the proxy must pass the Host through (Caddy does).

```js
if (!sameOrigin(request)) return new Response('Cross-origin request refused', { status: 403 });
```

## Running as a service

`vbc-service` runs the app in the current directory as a background service that starts at login and restarts when it exits: a systemd user unit on Linux, a launchd agent on macOS. It runs `server/index.js` with Bun by absolute path, from the app's directory, with `NODE_ENV=production`.

```json
"scripts": {
	"service:enable": "vbc-service enable --port 8033",
	"service:disable": "vbc-service disable",
	"service:reload": "vbc-service reload",
	"deploy": "bun run build && bun run service:reload"
}
```

The commands are `enable` (write the definition and start it; run it again after changing the flags), `disable` (stop and remove it), `start`, `stop`, `reload` (a restart, to pick up a new build), `status` and `logs`. The name and description come from package.json (without its scope); `--name`, `--description`, `--entry` and `--port` override them, and anything after `--` is passed to the server. On Linux, `loginctl enable-linger` keeps it running without a login session.

The same is a function, `service(command, options)`, and `serviceDefinition(options)` returns the unit or plist without installing it.

On macOS the agent is labelled `com.vanilla-bean.<name>`. An app moving from its own script disables the old agent first.

## Checks before a commit, and in CI

The library ships the pre-commit an app needs: lint, then the tests (when there are any), then `lldtdd lint` on staged `.lld.md` documents. An app runs it from a one-line hook of its own, through `sh` so it needn't be executable where the package manager put it:

```sh
#!/usr/bin/env sh
# .githooks/pre-commit
sh node_modules/@vanilla-bean/components/githooks/pre-commit || exit 1
```

```json
"prepare": "bun run prepare:githooks && bun run build",
"prepare:githooks": "[ -n \"$CI\" ] && exit 0 || (git config --local core.hooksPath .githooks || echo 'Cannot set core.hooksPath -- pre-commit checks will not run')"
```

Checks of the app's own go in the same file, after that line.

`templates/ci.yml` is the same gate for GitHub Actions, for commits that skipped the hook: copy it to `.github/workflows/ci.yml`. It installs from the lockfile, then lints, tests, checks the lld documents and builds, with a read-only token. Drop the two lld steps in an app without lld documents.

## Lint

`eslint.app.config.cjs` is the library's lint config set up for an app (spread it in the app's `eslint.config.cjs`):

- the app's own `spellcheck.config.cjs` words join the library's;
- Node and Bun globals, and `console`, in `server/`, `scripts/`, `cli/`, `bin/`, `e2e/`, `test/`, `client/build.js` and `*.config.js`, with no browser-support check there;
- a leading `_` marks an unused name on purpose (a callback's unused parameter, a property pulled out of a rest spread);
- JSDoc is optional.

## Ports

Each app takes its own port, so they run side by side on one machine:

| App                  | Port |
| -------------------- | ---- |
| humanity             | 8032 |
| home-page            | 8033 |
| game-night           | 8034 |
| pain-map             | 8035 |
| paude                | 8044 |
| land-ledger          | 7450 |
| htpc-remote          | 8793 |
| void-driller         | 1040 |
| sorcery-and-savagery | 3040 |
