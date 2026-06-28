import { nanoid } from 'nanoid';
import { parseMarkdown } from '../plugins/markdownLoader';
import { extractJSDoc } from '../devTools/extractJSDoc.js';

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

const clients = {};

// ─── Collaborative form state ─────────────────────────────────────────────────
// Tracks presence and focus for the CollaborativeForm example.
// Values are relayed but not stored — they live in each client's state.

const formUsers = {};

function broadcastForm(message, excludeClientId = null) {
	const data = JSON.stringify(message);

	for (const clientId of Object.keys(formUsers)) {
		if (clientId !== excludeClientId) clients[clientId]?.send(data);
	}
}

const reloadClients = () => {
	Object.entries(clients).forEach(([clientId, socket]) => {
		console.log(`Reloading ${clientId}`);

		socket.send('hotReload');
	});
};

const spawnBuild = async () => {
	const buildProcess = Bun.spawn(['bun', 'run', 'build:watch']);

	for await (const chunk of buildProcess.stdout) {
		const line = new TextDecoder().decode(chunk);

		console.log(line);

		if (line === 'build.success\n') reloadClients();
	}
};

const server = Bun.serve({
	port: 9999,
	fetch: async request => {
		const url = new URL(request.url);
		const path = url.pathname.replace(/^\/img/, '/../img').replace('@vanilla-bean/components', '..');

		if (request.method === 'GET' && path === '/') return new Response(Bun.file('demo/build/index.html'));

		if (request.method === 'GET' && path === '/ws') {
			const success = server.upgrade(request, { data: { clientId: nanoid() } });

			return success ? undefined : new Response('WebSocket upgrade error', { status: 400 });
		}

		console.log(path);

		if (request.method === 'GET' && path === '/api-pass') {
			const result = await fetch(url.searchParams.get('api'));
			console.log(result);

			return Response.json(
				await (result.headers.get('Content-Type').includes('application/json') ? result.json() : result.text()),
			);
		}

		if (path.endsWith('markdown/README.md')) {
			let response = await fetch(
				'https://raw.githubusercontent.com/lifeparticle/Markdown-Cheatsheet/refs/heads/main/README.md',
			);
			response = await response.text();
			response = parseMarkdown(response);

			return Response.json(response);
		}

		if (path.match(/^\/components\/[^/]+\/dependencies\.json$/)) {
			const componentName = path.match(/^\/components\/([^/]+)\//)[1];
			const { imports } = extractJSDoc(`components/${componentName}/${componentName}.js`);
			const seen = new Set();
			const deps = [];
			imports.forEach(imp => {
				const moduleRoot = imp.module.replace(/\/.*$/, '');
				const moduleRoute = DEP_MODULE_ROUTES[moduleRoot] ?? DEP_MODULE_ROUTES[imp.module];
				imp.imports.forEach(name => {
					if (seen.has(name)) return;
					seen.add(name);
					const route = moduleRoute ?? DEP_KNOWN_ROUTES[name] ?? (/^[A-Z]/.test(name) ? `#/${name}` : null);
					deps.push({ name, route });
				});
			});
			return Response.json(deps);
		}

		if (path.match(/^\/components\/[^/]+\/demo\.js$/)) {
			const filePath = path.slice(1);
			if (await Bun.file(filePath).exists()) {
				return Response.json(await Bun.file(filePath).text());
			}
		}

		if (path.endsWith('.md')) {
			console.log('Load Markdown', { path });

			// Serve npm package READMEs from node_modules
			const { dependencies: deps = {} } = JSON.parse(await Bun.file('./package.json').text());
			const npmPackages = Object.fromEntries(
				Object.keys(deps).map(pkg => [`dependencies/${pkg.replace(/^@[^/]+\//, '')}`, pkg]),
			);
			const npmKey = path.replace(/^\//, '').replace(/\/README\.md$/, '');
			if (npmPackages[npmKey]) {
				const pkgReadme = `node_modules/${npmPackages[npmKey]}/README.md`;
				if (await Bun.file(pkgReadme).exists()) {
					const content = await Bun.file(pkgReadme).text();
					return Response.json(parseMarkdown(content, pkgReadme));
				}
			}

			// Check for component documentation requests
			const componentMatch = path.match(/^\/components\/([^/]+)\/README\.md$/);
			if (componentMatch) {
				const componentName = componentMatch[1];
				const templatePath = './devTools/COMPONENT_README_TEMPLATE.md';

				if (await Bun.file(templatePath).exists()) {
					let templateContent = await Bun.file(templatePath).text();

					// Replace {ComponentName} placeholders with actual component name
					templateContent = templateContent.replaceAll('{ComponentName}', componentName);

					// Parse with component directory as context for JSDoc extraction
					const parsedMarkdown = parseMarkdown(templateContent, `components/${componentName}/README.md`);
					return Response.json(parsedMarkdown);
				}
			}

			// Handle regular markdown files
			const filePath = path.slice(1);
			if (await Bun.file(filePath).exists()) {
				const fileContent = await Bun.file(filePath).text();
				const stripped = fileContent.replace(/^#[^\n]*\n+/, '');
				const parsedMarkdown = parseMarkdown(stripped, filePath);
				return Response.json(parsedMarkdown);
			}
		}

		if (path.endsWith('design.excalidraw.png')) {
			const designPath = `components/${path.slice(1)}`;

			if (await Bun.file(designPath).exists()) {
				console.log('Load excalidraw design', { path });

				return new Response(Bun.file(designPath));
			}
		}

		let file = Bun.file(`demo/build${path}`);

		if (!(await file.exists())) file = Bun.file(`node_modules${path}`);
		if (!(await file.exists())) return new Response(`File Not Found: ${path}`, { status: 404 });

		return new Response(file);
	},
	websocket: {
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
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);

await spawnBuild();
