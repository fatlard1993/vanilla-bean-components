/**
 * Check if the current device is a mac
 * @return {Boolean} isMac
 */
export const isMac = () =>
	// eslint-disable-next-line compat/compat
	(window.navigator?.userAgentData?.platform || navigator.platform).toLowerCase().startsWith('mac');

/**
 * Copy a piece of text to the clipboard
 * @param {String} text - The text to copy to the clipboard
 * @return {Boolean} A boolean indicating the success of the action
 */
export const copyToClipboard = text => {
	if (!isSecureContext) return false;

	navigator.clipboard.writeText(text);

	return true;
};
