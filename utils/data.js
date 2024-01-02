/**
 * Debounce a function
 * @param {Function} callback - The function to debounced
 * @param {Number} delay - The number of ms to delay the running of the function
 */
export const debounce = (callback, delay = 400) => {
	let timerId;

	return (...args) => {
		clearTimeout(timerId);

		timerId = setTimeout(() => callback(...args), delay);
	};
};

export const throttle = (callback, delay) => {
	let previousCall = Date.now();

	return function () {
		const time = Date.now();

		if (time - previousCall >= delay) {
			previousCall = time;
			Reflect.apply(callback, null, arguments);
		}
	};
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
