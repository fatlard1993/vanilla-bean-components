const inset = side => `env(safe-area-inset-${side}, 0px)`;

/**
 * The parts of the screen a phone keeps for itself (a notch, rounded corners, the home indicator), as CSS lengths
 * that are 0px everywhere else. They only take a value once the page's viewport meta has `viewport-fit=cover`.
 * @example padding-bottom: calc(8px + ${safeArea.bottom});
 */
const safeArea = Object.freeze({
	top: inset('top'),
	right: inset('right'),
	bottom: inset('bottom'),
	left: inset('left'),
});

export default safeArea;
