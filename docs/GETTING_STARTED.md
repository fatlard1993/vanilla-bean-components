# Getting Started With vanilla-bean-components

> `npm install github:fatlard1993/vanilla-bean-components`

- [Context](../context/README.md)
- [Request](../request/README.md)
- [Elem](../Elem/README.md)
- [Component](../Component/README.md)
- [Theme](../theme/README.md)
- [Styled](../styled/README.md)

Being that this is primarily a development pattern, I'll simply recommend what I currently do. Feel free to stray from the path wherever makes sense for your use-case.

## HTML

Create an html file with whatever metadata, or remote styles/scripts that you need.

> [example](../demo/index.html)

### JS Entrypoint

This is the main entrypoint for your app.

```html
<script type="module" src="./index.js"></script>
```

## JS

Create a js file that will be main file for your frontend.

> [example](../demo/index.js)

Not _strictly necessary_, but the `Page` component is designed to be the top-level component; it injects the global theme css along with any css/font dependencies to the page and renders itself and its children when the DOM is loaded with `autoRender: 'onload'`.

```js
import { Page } from 'vanilla-bean-components';

new Page({ appendTo: document.body, content: 'Hello World' });
```

## Build

Now that you have the minimum app structure inplace you'll need some way to get it into the browser. You _can_ use a static build, but since the use-case of this library is more geared towards reactive apps you'll likely have or need a server component to integrate with. In either case I recommend considering [bun](https://bun.sh/), thats what I'm currently using, although you _should_ be able to use whatever else you want.

Heres a couple build examples with `bun`:

- Simple build script: `bun build client/index.html --outdir client/build --define 'process.env.AUTOPREFIXER_GRID=\"undefined\"'`
- More complex build script: [example](../devTools/build.js)

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

How to take advantage of the dev dependencies and various scripts and configs that vanilla-bean-components has setup:

Copy/paste any applicable devDependencies from vanilla-bean-components to your app.

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
