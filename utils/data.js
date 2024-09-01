/**
 * Debounce a function
 * @param {Function} callback - The function to debounced
 * @param {Number} delay - The number of ms after the last invocation to delay running the function
 */
export const debounce = (callback, delay = 400) => {
	let timerId;

	return (...args) => {
		clearTimeout(timerId);

		timerId = setTimeout(() => callback(...args), delay);
	};
};

/**
 * Throttle a function
 * @param {Function} callback - The function to throttled
 * @param {Number} delay - The number of ms allowed between invocations of the function
 */
export const throttle = (callback, delay = 400) => {
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
 * async delay
 * @param {Number} delay - The number of ms to await
 */
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Convert a number from one range to another
 * @param {Number} value - The number to convert
 * @param {Array} sourceRange - The range the value originates from
 * @param {Array} value - The range to convert the value into
 */
export const convertRange = (value, sourceRange, targetRange) =>
	((value - sourceRange[0]) * (targetRange[1] - targetRange[0])) / (sourceRange[1] - sourceRange[0]) + targetRange[0];

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

export const orderBy = orders => (a, b) => {
	const sortDirection = { asc: -1, desc: 1 };
	const sortCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

	if (!Array.isArray(orders)) orders = [orders];

	const totalOrders = orders.length;

	for (let index = 0; index < totalOrders; index++) {
		const { property, direction = 'asc' } = orders[index];
		const directionInt = sortDirection[direction];
		const compare = sortCollator.compare(
			property === undefined ? a : a[property],
			property === undefined ? b : b[property],
		);

		if (compare < 0) return directionInt;
		if (compare > 0) return -directionInt;
	}

	return 0;
};
