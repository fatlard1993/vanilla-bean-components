/**
 * Check if the current device is a mac
 * @returns {boolean} isMac
 */
export const isMac = () =>
	// eslint-disable-next-line compat/compat
	(window.navigator?.userAgentData?.platform || window.navigator.platform).toLowerCase().startsWith('mac');

/**
 * Copy a piece of text to the clipboard
 * @param {string} text - The text to copy to the clipboard
 * @returns {boolean} A boolean indicating the success of the action
 */
export const copyToClipboard = text => {
	if (!isSecureContext) return false;

	window.navigator.clipboard.writeText(text);

	return true;
};

/**
 * Get the current text from the clipboard
 * @returns {string} The current clipboard content
 */
export const readClipboard = async () => {
	if (!isSecureContext) return false;

	return await window.navigator.clipboard.readText();
};

/**
 * Vibrate the device (if supported)
 * @param {number|[...number]} durationPattern - The duration(s) to vibrate (for an array: odd indexes are vibrate and even are pause)
 * @returns {void}
 */
export const vibrate = (durationPattern = 30) => {
	if (!navigator.vibrate) return;

	// eslint-disable-next-line compat/compat
	navigator.vibrate(durationPattern);
};

/**
 * Vibrate the device for a short burst to serve as a tactile response (if supported)
 * @returns {void}
 */
export const tactileResponse = () => vibrate(30);
