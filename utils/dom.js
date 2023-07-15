/**
 * Check if the current device is a mac
 * @return {Boolean} isMac
 */
export const isMac = () =>
	// eslint-disable-next-line compat/compat
	(window.navigator?.userAgentData?.platform || navigator.platform).toLowerCase().startsWith('mac');

/**
 * Check if the passed parameter is an HTML NodeList
 * @param {Object} nodes - The potential HTML NodeList
 * @return {Boolean} isNodeList
 */
export const isNodeList = nodes => {
	const nodeCount = nodes?.length;
	const nodesString = Object.prototype.toString.call(nodes);
	const stringRegex = /^\[object (HTMLCollection|NodeList|Object)]$/;

	return (
		typeof nodes === 'object' &&
		typeof nodeCount === 'number' &&
		stringRegex.test(nodesString) &&
		(nodeCount === 0 || (typeof nodes[0] === 'object' && nodes[0].nodeType > 0))
	);
};

/**
 * Append a style tag with custom css onto the page at runtime
 * @param {String} css - The css string to inject into the page
 */
export const appendStyles = css => {
	const style = document.createElement('style');

	style.innerHTML = css;

	document.head.append(style);
};

/**
 * Retrieve the current devices orientation
 * @return {'landscape'|'portrait'} The current device's screen orientation
 */
export const getScreenOrientation = () => {
	let orientation = 'primary';

	if (window.screen && window.screen.orientation && window.screen.orientation.type)
		orientation = window.screen.orientation.type;
	else if (window.orientation !== undefined)
		orientation = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';

	return orientation;
};
