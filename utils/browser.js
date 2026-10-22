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
 * Check if the current device is a Mac, an iPhone or an iPad: the ones whose shortcuts use ⌘
 * @returns {boolean} isMac
 */
export const isMac = () =>
	// eslint-disable-next-line compat/compat
	/mac|iphone|ipad/i.test(window.navigator?.userAgentData?.platform || window.navigator.platform || '');

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

/**
 * Keep the screen awake (a game in play, a remote in hand), taking the lock again whenever the page comes back into
 * view, since the browser lets it go when the page is hidden. Best-effort: where it isn't supported or is refused,
 * nothing happens.
 * @returns {Function} Lets the screen sleep again
 */
export const requestWakeLock = () => {
	if (!('wakeLock' in navigator)) return () => {};

	let lock = null;
	let pending = false;
	let released = false;

	const acquire = async () => {
		// One request at a time, so two quick turns back to the page can't leave a lock nothing releases
		if (pending || released || document.visibilityState !== 'visible' || (lock && !lock.released)) return;

		pending = true;

		try {
			// Guarded above: only reached where wakeLock exists
			// eslint-disable-next-line compat/compat
			lock = await navigator.wakeLock.request('screen');

			if (released) lock.release();
		} catch {
			// Refused (low battery, no user gesture yet) or unsupported; the next visible turn tries again
		} finally {
			pending = false;
		}
	};

	document.addEventListener('visibilitychange', acquire);
	acquire();

	return () => {
		released = true;
		document.removeEventListener('visibilitychange', acquire);
		lock?.release?.();
		lock = null;
	};
};

/**
 * Keep the page to the part a phone's keyboard leaves showing. The keyboard covers the bottom of the page rather than
 * shrinking it (on iOS always, on Android unless the viewport asks), which hides whatever sits at the bottom. The
 * visible height goes to `--visible-height`, and to the document's height unless setHeight is false; while
 * pinch-zoomed the visible part is a magnified piece of the page, so the page is left alone.
 * @param {object} [options] - Options
 * @param {boolean} [options.setHeight] - Also size the document to the visible part
 * @returns {Function} Stops following the keyboard
 */
export const fitToKeyboard = ({ setHeight = true } = {}) => {
	const visible = window.visualViewport;

	if (!visible) return () => {};

	const root = document.documentElement;
	const fit = () => {
		const zoomed = visible.scale > 1.01;

		root.style.setProperty('--visible-height', `${visible.height}px`);
		if (setHeight) root.style.height = zoomed ? '' : `${visible.height}px`;
		if (!zoomed && window.scrollY) window.scrollTo(0, 0);
	};

	visible.addEventListener('resize', fit);
	visible.addEventListener('scroll', fit);
	fit();

	return () => {
		visible.removeEventListener('resize', fit);
		visible.removeEventListener('scroll', fit);
		root.style.removeProperty('--visible-height');
		if (setHeight) root.style.height = '';
	};
};

/**
 * A value kept in localStorage as JSON, or `fallback` when there is none, it won't parse, or storage is refused (a
 * private window, blocked site data)
 * @param {string} key - The storage key
 * @param {*} [fallback] - What to answer instead
 * @returns {*} The value
 */
export const readStorage = (key, fallback = null) => {
	try {
		return JSON.parse(localStorage.getItem(key)) ?? fallback;
	} catch {
		return fallback;
	}
};

/**
 * Keep a value in localStorage as JSON, or remove it when `undefined`. Refused storage is ignored: the value lasts until
 * the page goes.
 * @param {string} key - The storage key
 * @param {*} value - Anything JSON holds
 */
export const writeStorage = (key, value) => {
	try {
		if (value === undefined) localStorage.removeItem(key);
		else localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Storage refused
	}
};
