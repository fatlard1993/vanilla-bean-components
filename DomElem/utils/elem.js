export const observeElementConnection = ({ parent, target, onConnected, onDisconnected }) => {
	const observer = new MutationObserver(mutationList => {
		for (const mutation of mutationList) {
			if (mutation.removedNodes.length > 0 && mutation.removedNodes[0] === target) {
				onDisconnected(mutation);
			} else if (mutation.addedNodes.length > 0 && mutation.addedNodes[0] === target) {
				onConnected(mutation);
			}
		}
	});

	observer.observe(parent, { childList: true, subtree: true });

	return observer;
};
