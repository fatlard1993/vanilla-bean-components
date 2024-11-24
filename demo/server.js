import { nanoid } from 'nanoid';
import { debounce } from '../utils/data';

const clients = {};

const buildProcess = Bun.spawn(['bun', 'run', 'build:dev']);
const reader = buildProcess.stdout.getReader();

const handleBuildChange = () => {
	Object.entries(clients).forEach(([clientId, socket]) => {
		console.log(`Reloading ${clientId}`);

		socket.send('hotReload');
	});

	reader.read().then(debounce(handleBuildChange)).catch(console.error);
};

handleBuildChange();

const server = Bun.serve({
	port: 9999,
	fetch: async request => {
		const path = new URL(request.url).pathname.replace('vanilla-bean-components', '..');

		console.log(path);

		if (request.method === 'GET' && path === '/') return new Response(Bun.file('demo/index.html'));

		if (request.method === 'GET' && path === '/ws') {
			const success = server.upgrade(request, { data: { clientId: nanoid() } });

			return success ? undefined : new Response('WebSocket upgrade error', { status: 400 });
		}

		if (path.endsWith('.md') && (await Bun.file(path.slice(1)).exists())) {
			return Response.json(await import(`..${path}`));
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
