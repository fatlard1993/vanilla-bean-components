/**
 * Check if the current device is a mac
 * @return {Boolean} isMac
 */
export const isMac = () =>
	// eslint-disable-next-line compat/compat
	(window.navigator?.userAgentData?.platform || navigator.platform).toLowerCase().startsWith('mac');

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
