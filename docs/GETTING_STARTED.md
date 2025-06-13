# Getting Started With vanilla-bean-components

> `npm install github:fatlard1993/vanilla-bean-components`

This is intended to primarily be a development pattern, so I'll simply recommend what I currently do. Feel free to stray from the path wherever makes sense for your use-case.

## HTML

Create an html file with whatever metadata, or remote styles/scripts that you need.

```html
<!doctype html>
<html lang="en">
	<head>
		<title>my-cool-app</title>

		<meta charset="UTF-8" />
		<meta http-equiv="cleartype" content="on" />

		<meta name="author" content="me" />
		<meta name="description" content="demo" />

		<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
		<meta name="HandheldFriendly" content="true" />
		<meta name="MobileOptimized" content="320" />

		<meta name="mobile-web-app-capable" content="yes" />

		<meta name="apple-mobile-web-app-title" content="my-cool-app" />
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

		<meta name="application-name" content="my-cool-app" />
		<meta name="msapplication-tooltip" content="my-cool-app" />
		<meta name="msapplication-TileColor" content="#bada55" />

		<meta name="theme-color" content="#bada55" />

		<script type="module" src="./index.js"></script>
	</head>
	<body></body>
</html>
```

### JS Entrypoint

This is the main entrypoint for your app.

```html
<script type="module" src="./index.js"></script>
```

## JS

Create a js file that will be main file for your frontend.

While not _strictly necessary_, the `Page` component is designed to be the top-level component; it injects the global theme css along with any css/font dependencies to the page and renders itself and its children when the DOM is loaded with `autoRender: 'onload'`.

```js
import { Page } from 'vanilla-bean-components';

new Page({ appendTo: document.body, content: 'Hello World' });
```

## Build

With the minimum app structure inplace you'll need some way to get it into the browser. You _can_ use a static build, but since the use-case of this pattern is more geared towards reactive apps you'll likely have or need a server component to integrate with. In either case I recommend considering [bun](https://bun.sh/), thats what I'm currently using, although you _should_ be able to use whatever else you want.

Heres a couple build examples with `bun`:

- Simple build script:

```sh
bun build client/index.html --outdir client/build --define 'process.env.AUTOPREFIXER_GRID=\"undefined\"'
```

- More complex build script:

```js
import { watch } from 'fs';
import { buildLoader as asText } from '../plugins/asText';
import { buildLoader as markdownLoader } from '../plugins/markdownLoader';

const build = async () => {
	console.log('Building...');

	const buildResults = await Bun.build({
		entrypoints: ['demo/index.html'],
		outdir: 'demo/build',
		define: {
			'process.env.AUTOPREFIXER_GRID': 'undefined',
			'process.cwd': 'String',
		},
		plugins: [asText, markdownLoader],
	});

	console.log(buildResults.success ? 'build.success' : buildResults.logs);

	return buildResults;
};

const enableWatcher = process.argv[2] === '--watch';
const watcherIgnore = /\.asText$|^demo\/build|^\.|^img\/|^docs\/|^devTools\//;

if (enableWatcher) {
	console.log(`Initializing watcher`);

	const watcher = watch(`${import.meta.dir}/..`, { recursive: true }, (event, filename) => {
		if (watcherIgnore.test(filename)) return;

		console.log(`Detected ${event} in ${filename}`);

		build();
	});

	process.on('SIGINT', () => {
		watcher.close();
		process.exit(0);
	});
}

await build();
```

## Server

Heres an example of a simple server built with bun:

```js
const server = Bun.serve({
	port: 9999,
	fetch: async request => {
		const path = new URL(request.url).pathname;

		if (request.method === 'GET' && path === '/') return new Response(Bun.file('client/build/index.html'));

		console.log(path);

		let file = Bun.file(`client/build${path}`);

		if (!(await file.exists())) file = Bun.file(`node_modules${path}`);
		if (!(await file.exists())) return new Response(`File Not Found: ${path}`, { status: 404 });

		return new Response(file);
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);
```

## Developer dependencies

Take advantage of the dev dependencies and various scripts and configs that vanilla-bean-components has setup:

> Copy/paste any applicable devDependencies from vanilla-bean-components to your app.

`prettier.config.cjs`

```js
module.exports = require('vanilla-bean-components/prettier.config.cjs');
```

`eslint.config.cjs`

```js
const globals = require('globals');
const vanillaBeanEslint = require('vanilla-bean-components/eslint.config.cjs');
const vanillaBeanSpellcheck = require('vanilla-bean-components/spellcheck.config.cjs');
const localSpellcheck = require('./spellcheck.config.cjs');

module.exports = [
	...vanillaBeanEslint,
	{
		rules: {
			'spellcheck/spell-checker': [
				'warn',
				{
					...vanillaBeanSpellcheck,
					...localSpellcheck,
					skipWords: [...vanillaBeanSpellcheck.skipWords, ...localSpellcheck.skipWords],
				},
			],
		},
	},
	{
		files: ['server/*.js', 'server/**/*.js'],
		languageOptions: {
			globals: {
				...globals.node,
				Bun: true,
			},
		},
		rules: {
			'no-console': 'off',
		},
	},
];
```

`test-setup.js`

```js
/// <reference lib="dom" />

import 'vanilla-bean-components/test-setup.js';
```
