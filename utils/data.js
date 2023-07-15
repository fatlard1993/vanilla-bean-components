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

export const conditionalList = conditionalItems =>
	conditionalItems
		.filter(
			item =>
				item.if ||
				item.elseItem ||
				Array.isArray(item.elseItems) ||
				Array.isArray(item.alwaysItems) ||
				item.alwaysItem !== undefined,
		)
		.flatMap(item => {
			if (item.alwaysItem !== undefined) return [item.alwaysItem];
			if (item.if && item.thenItem !== undefined) return [item.thenItem];
			if (!item.if && item.elseItem !== undefined) return [item.elseItem];

			if (Array.isArray(item.alwaysItems)) return item.alwaysItems;
			if (item.if && Array.isArray(item.thenItems)) return item.thenItems;
			if (!item.if && Array.isArray(item.elseItems)) return item.elseItems;

			return [];
		});
