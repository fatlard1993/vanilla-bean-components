import { state } from '../components/state';

/**
 * Debounce a function
 * @param {Function} callback - The function to debounced
 */
export const debounceCallback = (callback, delay = 400, ...args) => {
	if (state?.debounceCallback?.[callback]) clearTimeout(state.debounceCallback[callback]);

	state.debounceCallback = state.debounceCallback || {};

	state.debounceCallback[callback] = setTimeout(() => callback(...args), delay);
};

/**
 * Retrieve a list of non-native properties from a javascript object
 * @param {Object} object - The target Object
 * @return {Array} An array of the string property names
 */
export const getCustomProperties = object =>
	[
		...new Set(object ? [...Reflect.ownKeys(object), ...getCustomProperties(Object.getPrototypeOf(object))] : []),
	].filter(
		key =>
			typeof key !== 'string' ||
			!/^(?:constructor|prototype|arguments|caller|name|length|toString|toLocaleString|valueOf|apply|bind|call|__proto__| __defineGetter__|__defineSetter__|hasOwnProperty|__lookupGetter__|__lookupSetter__|__defineGetter__|isPrototypeOf|propertyIsEnumerable)$/.test(
				key,
			),
	);
