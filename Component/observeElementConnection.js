const registry = new Map();
let sharedObserver = null;

/**
 * Runs one element's callback, reporting what it throws rather than letting it end the walk: every other element in
 * the batch still gets its callback.
 * @param {Function} callback - An element's onConnected or onDisconnected
 * @param {MutationRecord} mutation - The mutation that connected or disconnected it
 */
const isolated = (callback, mutation) => {
	try {
		callback(mutation);
	} catch (error) {
		globalThis.reportError ? globalThis.reportError(error) : console.error(error); // eslint-disable-line no-console
	}
};

/**
 *
 */
function ensureObserver() {
	if (sharedObserver) return;

	sharedObserver = new MutationObserver(mutations => {
		for (const mutation of mutations) {
			for (const node of mutation.removedNodes) {
				for (const [target, callbacks] of registry) {
					if ((node === target || node.contains?.(target)) && !target.isConnected)
						isolated(callbacks.onDisconnected, mutation);
				}
			}
			for (const node of mutation.addedNodes) {
				for (const [target, callbacks] of registry) {
					if ((node === target || node.contains?.(target)) && target.isConnected)
						isolated(callbacks.onConnected, mutation);
				}
			}
		}
	});

	sharedObserver.observe(document, { childList: true, subtree: true });
}

/**
 * Observe DOM connection/disconnection of an element via a shared MutationObserver.
 * All registrations share one observer; the observer is torn down when no targets remain.
 * Fires when the target itself or any ancestor is added or removed; a move within the document is not a disconnect.
 * @param {object} config - Observer registration options
 * @param {Node} config.target - Target element to watch for add/remove
 * @param {Function} config.onConnected - Called when target is added to the document
 * @param {Function} config.onDisconnected - Called when target is removed from the document
 * @returns {{ disconnect: Function }} Handle - call disconnect() to deregister
 */
export const observeElementConnection = ({ target, onConnected, onDisconnected }) => {
	ensureObserver();
	registry.set(target, { onConnected, onDisconnected });

	return {
		disconnect() {
			registry.delete(target);

			if (registry.size === 0) {
				sharedObserver?.disconnect();
				sharedObserver = null;
			}
		},
	};
};
