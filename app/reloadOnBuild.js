import { connectSocket } from '../utils/socket';
import { HOT_RELOAD_PATH } from './hotReloadPath';

/**
 * Reload the page on each build of a development server's hot reload, and once it's back after a restart: whatever it
 * serves then is newer than this page. A page that never connected is served by something that isn't watching, and
 * isn't retried.
 * @param {object} [options] - Options
 * @param {Function} [options.reload] - What reloading is
 * @returns {object} The socket (connectSocket)
 */
export const reloadOnBuild = ({ reload = () => window.location.reload() } = {}) => {
	let connected = false;

	const socket = connectSocket(HOT_RELOAD_PATH, { onRestored: reload });

	socket.addEventListener('open', () => (connected = true));
	socket.addEventListener('close', () => {
		if (!connected) socket.close();
	});
	socket.onMessage(data => data === 'hotReload' && reload());

	return socket;
};

// Read plainly, so a bundler's define replaces it; a page with no bundler has no process, and no hot reload
let development = false;

try {
	development = process.env.NODE_ENV === 'development';
} catch {
	// no process in this runtime and no define for it
}

if (development) reloadOnBuild();
