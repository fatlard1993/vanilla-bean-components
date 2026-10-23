import { nanoid } from 'nanoid';
import { requestMatch, serve, serveStatic } from '../app';
import { parseMarkdown } from '../plugins/markdownLoader';
import { extractJSDoc } from '../devTools/extractJSDoc.js';
import { buildOptions } from '../devTools/build.js';
import { componentReadme } from './componentReadme.js';

const DEP_MODULE_ROUTES = {
	utils: '#/documentation/utils',
	styled: '#/documentation/styled',
};
const DEP_KNOWN_ROUTES = {
	EventTarget: 'https://developer.mozilla.org/docs/Web/API/EventTarget',
	Elem: '#/documentation/Elem',
	Component: '#/documentation/Component',
	styled: '#/documentation/styled',
	theme: '#/documentation/theme',
};

const MARKDOWN_CHEATSHEET =
	'https://raw.githubusercontent.com/lifeparticle/Markdown-Cheatsheet/refs/heads/main/README.md';

// Each dependency's README, by the demo's name for it: dependencies/oxject → @vanilla-bean/oxject
const { dependencies = {} } = await Bun.file('./package.json').json();
const dependencyDocs = Object.fromEntries(
	Object.keys(dependencies).map(name => [name.replace(/^@[^/]+\//, ''), `node_modules/${name}/README.md`]),
);

const existing = async path => {
	const file = Bun.file(path);

	return (await file.exists()) ? file : undefined;
};

const notFound = path => Response.json({ error: `Not found: ${path}` }, { status: 404 });

// ─── Collaborative form state ─────────────────────────────────────────────────
// Tracks presence and focus for the CollaborativeForm example.
// Values are relayed but not stored - they live in each client's state.

const clients = {};
const formUsers = {};

function broadcastForm(message, excludeClientId = null) {
	const data = JSON.stringify(message);

	for (const clientId of Object.keys(formUsers)) {
		if (clientId !== excludeClientId) clients[clientId]?.send(data);
	}
}

const websocket = {
	open(socket) {
		clients[socket.data.clientId] = socket;
	},
	message(socket, raw) {
		const { clientId } = socket.data;
		let message;

		try {
			message = JSON.parse(raw);
		} catch {
			return;
		}

		if (!message.type?.startsWith('form:')) return;

		if (message.type === 'form:join') {
			formUsers[clientId] = { ...message.data, focusedField: null };

			// Send current presence to the new joiner
			socket.send(
				JSON.stringify({
					type: 'form:state',
					data: { users: Object.values(formUsers).filter(u => u.userId !== message.data.userId) },
				}),
			);

			broadcastForm(message, clientId);
		} else if (message.type === 'form:focus') {
			if (formUsers[clientId]) formUsers[clientId].focusedField = message.data.fieldId;
			broadcastForm(message, clientId);
		} else if (message.type === 'form:blur') {
			if (formUsers[clientId]) formUsers[clientId].focusedField = null;
			broadcastForm(message, clientId);
		} else if (message.type === 'form:input') {
			broadcastForm(message, clientId);
		}
	},
	close(socket) {
		const { clientId } = socket.data;

		if (formUsers[clientId]) {
			const { userId } = formUsers[clientId];
			delete formUsers[clientId];
			broadcastForm({ type: 'form:leave', data: { userId } });
		}

		delete clients[clientId];
	},
};

// ─── Routes ───────────────────────────────────────────────────────────────────

const componentRoutes = {
	// The demo view's live run of the component's lld document
	'lld-run.json': async name => {
		const lldFile = `components/${name}/${name}.lld.md`;

		if (!(await existing(lldFile))) return notFound(lldFile);

		const run = Bun.spawn(['bun', 'run', 'devTools/lldRunner.js', lldFile], { stdout: 'pipe', stderr: 'ignore' });
		const output = await new Response(run.stdout).text();

		await run.exited;

		try {
			return Response.json(JSON.parse(output));
		} catch {
			return Response.json({ error: `lldRunner wrote no JSON: ${output.slice(0, 500)}` });
		}
	},
	'dependencies.json': name => {
		const { imports } = extractJSDoc(`components/${name}/${name}.js`);
		const seen = new Set();
		const deps = [];

		imports.forEach(imp => {
			const moduleRoot = imp.module.replace(/\/.*$/, '');
			const moduleRoute = DEP_MODULE_ROUTES[moduleRoot] ?? DEP_MODULE_ROUTES[imp.module];

			imp.imports.forEach(importName => {
				if (seen.has(importName)) return;
				seen.add(importName);
				const route =
					moduleRoute ?? DEP_KNOWN_ROUTES[importName] ?? (/^[A-Z]/.test(importName) ? `#/${importName}` : null);
				deps.push({ name: importName, route });
			});
		});

		return Response.json(deps);
	},
	'demo.js': async name => {
		const demo = await existing(`components/${name}/demo.js`);

		return demo && Response.json(await demo.text());
	},
	// Its own README, when it has one, with the reference extracted from its JSDoc after it
	'README.md': async name => {
		const readmePath = `components/${name}/README.md`;
		const readme = await existing(readmePath);
		const markdown = componentReadme({
			name,
			template: await Bun.file('devTools/COMPONENT_README_TEMPLATE.md').text(),
			readme: await readme?.text(),
		});

		return Response.json(parseMarkdown(markdown, readmePath));
	},
};

const router = async (request, server) => {
	const { pathname } = new URL(request.url);
	let match;

	if (requestMatch('GET', '/ws', request)) {
		return server.upgrade(request, { data: { clientId: nanoid() } })
			? undefined
			: new Response('WebSocket upgrade error', { status: 400 });
	}

	if ((match = requestMatch('GET', '/api-pass', request))) {
		const result = await fetch(match.api);

		return Response.json(
			await (result.headers.get('Content-Type')?.includes('application/json') ? result.json() : result.text()),
		);
	}

	if (requestMatch('GET', '/markdown/README.md', request)) {
		return Response.json(parseMarkdown(await (await fetch(MARKDOWN_CHEATSHEET)).text(), 'markdown/README.md'));
	}

	if ((match = requestMatch('POST', '/components/:name/lld-run.json', request))) {
		return componentRoutes['lld-run.json'](match.name);
	}

	if ((match = requestMatch('GET', '/components/:name/:file', request)) && componentRoutes[match.file]) {
		const response = await componentRoutes[match.file](match.name);

		if (response) return response;
	}

	if (request.method === 'GET' && pathname.endsWith('.lld.md')) {
		const lld = await existing(pathname.slice(1));

		return lld ? Response.json({ raw: await lld.text() }) : notFound(pathname.slice(1));
	}

	if ((match = requestMatch('GET', '/dependencies/:name/README.md', request)) && dependencyDocs[match.name]) {
		const readme = await existing(dependencyDocs[match.name]);

		if (readme) return Response.json(parseMarkdown(await readme.text(), dependencyDocs[match.name]));
	}

	// Any other markdown in the project (docs/, app/README.md, …), its title left to the page
	if (request.method === 'GET' && pathname.endsWith('.md')) {
		const markdown = await existing(pathname.slice(1));

		if (markdown)
			return Response.json(parseMarkdown((await markdown.text()).replace(/^#[^\n]*\n+/, ''), pathname.slice(1)));
	}

	if ((match = requestMatch('GET', '/:name/design.excalidraw.png', request))) {
		const design = await existing(`components/${match.name}/design.excalidraw.png`);

		if (design) return new Response(design);
	}

	return serveStatic(request, { root: 'demo/build', packages: ['emoji-js'] });
};

await serve({ port: 9999, router, websocket, build: buildOptions });
