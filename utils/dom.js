/**
 * Check if the current device is a mac
 * @return {Boolean} isMac
 */
export const isMac = () =>
	// eslint-disable-next-line compat/compat
	(window.navigator?.userAgentData?.platform || window.navigator.platform).toLowerCase().startsWith('mac');

/**
 * Copy a piece of text to the clipboard
 * @param {String} text - The text to copy to the clipboard
 * @return {Boolean} A boolean indicating the success of the action
 */
export const copyToClipboard = text => {
	if (!isSecureContext) return false;

	window.navigator.clipboard.writeText(text);

	return true;
};

/**
 * Get the current text from the clipboard
 * @return {String} The current clipboard content
 */
export const readClipboard = async () => {
	if (!isSecureContext) return false;

	return await window.navigator.clipboard.readText();
};

export const tactileResponse = () => {
	if (!navigator.vibrate) return;

	// eslint-disable-next-line compat/compat
	navigator.vibrate(30);
};
