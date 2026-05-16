/**
 * Observe DOM connection/disconnection of an element via MutationObserver.
 * NOTE: The observer scope is fixed to `parent` at creation time and never updates.
 * If the target is moved to a different parent, connection events will stop firing.
 * @param {object} config
 * @param {Node} config.parent - Parent node to observe (fixed at init, never re-anchors)
 * @param {Node} config.target - Target element to watch for add/remove
 * @param {Function} config.onConnected - Called when target is added to parent's subtree
 * @param {Function} config.onDisconnected - Called when target is removed from parent's subtree
 * @returns {MutationObserver} Observer instance (call .disconnect() to clean up)
 */
export const observeElementConnection = ({ parent, target, onConnected, onDisconnected }) => {
	const observer = new MutationObserver(mutationList => {
		for (const mutation of mutationList) {
			for (const node of mutation.removedNodes) {
				if (node === target) {
					onDisconnected(mutation);
					break;
				}
			}
			for (const node of mutation.addedNodes) {
				if (node === target) {
					onConnected(mutation);
					break;
				}
			}
		}
	});

	observer.observe(parent, { childList: true, subtree: true });

	return observer;
};
