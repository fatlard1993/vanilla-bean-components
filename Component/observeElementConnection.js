const registry = new Map();
let sharedObserver = null;

/**
 *
 */
function ensureObserver() {
	if (sharedObserver) return;

	sharedObserver = new MutationObserver(mutations => {
		for (const mutation of mutations) {
			for (const node of mutation.removedNodes) {
				for (const [target, callbacks] of registry) {
					if (node === target || node.contains?.(target)) callbacks.onDisconnected(mutation);
				}
			}
			for (const node of mutation.addedNodes) {
				for (const [target, callbacks] of registry) {
					if (node === target || node.contains?.(target)) callbacks.onConnected(mutation);
				}
			}
		}
	});

	sharedObserver.observe(document, { childList: true, subtree: true });
}

/**
 * Observe DOM connection/disconnection of an element via a shared MutationObserver.
 * All registrations share one observer; the observer is torn down when no targets remain.
 * Fires correctly when the target itself or any ancestor is moved.
 * @param {object} config - Observer registration options
 * @param {Node} config.target - Target element to watch for add/remove
 * @param {Function} config.onConnected - Called when target is added to the document
 * @param {Function} config.onDisconnected - Called when target is removed from the document
 * @returns {{ disconnect: Function }} Handle — call disconnect() to deregister
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
