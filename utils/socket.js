const MIN_DELAY = 1000;
const MAX_DELAY = 10_000;

/**
 * A WebSocket that comes back. A lost connection is retried for as long as it's open, backing off to every 10 seconds,
 * and at once when the page comes back into view or the network comes back. Listeners carry over to each new
 * connection.
 * @example
 * const socket = connectSocket('/ws', { onLost: () => banner.show(), onRestored: () => banner.hide() });
 * const stop = socket.onMessage(data => console.log(data));
 * socket.send({ type: 'join' });
 * @param {string} [path] - Path on this host, or a full ws(s) URL; a path goes over wss on an https page
 * @param {object} [options] - Options
 * @param {Function} [options.onLost] - Called once when a connection that was open drops
 * @param {Function} [options.onRestored] - Called once when it's open again
 * @returns {object} `send`, `onMessage`, `addEventListener`, `removeEventListener`, `close`, and `readyState`
 */
export const connectSocket = (path = '/ws', { onLost, onRestored } = {}) => {
	const url = /^wss?:/.test(path)
		? path
		: `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}${path.startsWith('/') ? '' : '/'}${path}`;
	const listeners = new Set();

	let socket;
	let retry;
	let delay = MIN_DELAY;
	let lost = false;
	let closed = false;

	const connect = () => {
		socket = new WebSocket(url);

		for (const [type, listener, options] of listeners) socket.addEventListener(type, listener, options);

		socket.addEventListener('open', () => {
			delay = MIN_DELAY;

			if (lost) {
				lost = false;
				onRestored?.();
			}
		});

		socket.addEventListener('close', () => {
			if (closed) return;

			// Said once per outage, not once per attempt
			if (!lost) {
				lost = true;
				onLost?.();
			}

			clearTimeout(retry);
			retry = setTimeout(connect, delay);
			delay = Math.min(delay * 2, MAX_DELAY);
		});
	};

	// A page back in view, or a network back up, shouldn't wait out the backoff
	const reconnectNow = () => {
		if (closed || socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) return;

		clearTimeout(retry);
		delay = MIN_DELAY;
		connect();
	};
	const onVisible = () => document.visibilityState === 'visible' && reconnectNow();

	document.addEventListener('visibilitychange', onVisible);
	window.addEventListener('online', reconnectNow);

	connect();

	const addEventListener = (type, listener, options) => {
		listeners.add([type, listener, options]);
		socket.addEventListener(type, listener, options);
	};

	const removeEventListener = (type, listener, options) => {
		for (const entry of listeners) if (entry[0] === type && entry[1] === listener) listeners.delete(entry);

		socket.removeEventListener(type, listener, options);
	};

	return {
		get readyState() {
			return socket.readyState;
		},
		/**
		 * Send now, as JSON unless it's already a string or binary. Nothing is queued while disconnected.
		 * @param {*} data - What to send
		 * @returns {boolean} Whether it went
		 */
		send(data) {
			if (socket.readyState !== WebSocket.OPEN) return false;

			socket.send(
				typeof data === 'string' || data instanceof Blob || data instanceof ArrayBuffer || ArrayBuffer.isView(data)
					? data
					: JSON.stringify(data),
			);

			return true;
		},
		/**
		 * Listen for messages, parsed from JSON when they are JSON
		 * @param {Function} callback - Called with each message's data
		 * @returns {Function} Stops listening
		 */
		onMessage(callback) {
			const listener = event => {
				let data = event.data;

				try {
					data = JSON.parse(data);
				} catch {
					// Not JSON: passed on as it came
				}

				callback(data, event);
			};

			addEventListener('message', listener);

			return () => removeEventListener('message', listener);
		},
		addEventListener,
		removeEventListener,
		/** Close for good: no reconnecting */
		close() {
			closed = true;
			clearTimeout(retry);
			document.removeEventListener('visibilitychange', onVisible);
			window.removeEventListener('online', reconnectNow);
			socket.close();
		},
	};
};
