import { nanoid } from 'nanoid';
import { parseMarkdown } from '../plugins/markdownLoader';

const clients = {};

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
		const path = url.pathname.replace(/^\/img/, '/../img').replace('vanilla-bean-components', '..');

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

		if (path.endsWith('.md') && (await Bun.file(path.slice(1)).exists())) {
			console.log('Load Markdown', { path });

			const filePath = path.slice(1);
			const fileContent = await Bun.file(filePath).text();
			const parsedMarkdown = parseMarkdown(fileContent, filePath);
			return Response.json(parsedMarkdown);
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
		close(socket) {
			delete clients[socket.data.clientId];
		},
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);

await spawnBuild();
