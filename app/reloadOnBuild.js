import { HOT_RELOAD_PATH } from './hotReloadPath';

const connect = ({ reconnecting = false } = {}) => {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const socket = new WebSocket(`${protocol}//${window.location.host}${HOT_RELOAD_PATH}`);
	let connected = false;

	socket.addEventListener('open', () => {
		connected = true;

		// The server went away and came back: whatever it serves now is newer than this page
		if (reconnecting) window.location.reload();
	});

	socket.addEventListener('message', ({ data }) => {
		if (data === 'hotReload') window.location.reload();
	});

	// A page that never connected is served by something that isn't watching; it isn't retried
	socket.addEventListener('close', () => {
		if (connected || reconnecting) setTimeout(() => connect({ reconnecting: true }), 1000);
	});
};

if (process.env.NODE_ENV === 'development') connect();
