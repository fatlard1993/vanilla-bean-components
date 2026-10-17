/**
 * Whether the current runtime is in development mode.
 * Checks process.env.NODE_ENV (Node/Bun, or a bundler's define of it) and import.meta.env (Vite/ESBuild).
 * Defaults to false (production-safe) when neither is set.
 */
export const isDev = (() => {
	// Read plainly, with no typeof guard or optional chaining, so a bundler's define replaces it with the build's mode
	try {
		if (process.env.NODE_ENV === 'production') return false;
		if (process.env.NODE_ENV === 'development') return true;
	} catch {
		// no process in this runtime and no define for it
	}

	try {
		if (typeof import.meta !== 'undefined' && import.meta.env?.PROD === true) return false;
		if (
			typeof import.meta !== 'undefined' &&
			(import.meta.env?.DEV === true || import.meta.env?.NODE_ENV === 'development')
		)
			return true;
		// Bare browser import with no bundler - treat localhost as dev so warnings surface
		if (typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1'))
			return true;
		return false;
	} catch {
		return false;
	}
})();

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
 * @returns {Promise<boolean>} Whether the text reached the clipboard
 */
export const copyToClipboard = async text => {
	if (window.isSecureContext && navigator.clipboard) {
		try {
			await navigator.clipboard.writeText(text ?? '');

			return true;
		} catch {
			// Denied, or the page lacks focus; the older way below may still work
		}
	}

	const textarea = document.createElement('textarea');

	textarea.value = text ?? '';
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	document.body.appendChild(textarea);
	textarea.select();

	let ok = false;

	try {
		ok = document.execCommand('copy');
	} catch {
		// execCommand not supported
	}

	textarea.remove();

	return ok;
};

/**
 * Get the current text from the clipboard
 * @returns {string} The current clipboard content
 */
export const readClipboard = async () => {
	if (!window.isSecureContext || !navigator.clipboard) return false;

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
