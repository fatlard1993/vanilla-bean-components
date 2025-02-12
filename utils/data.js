/**
 * Debounce a function
 * @param {Function} callback - The function to debounced
 * @param {number} delay - The number of ms after the last invocation to delay running the function
 * @returns {Function} The now debounce aware callback
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
 * @param {number} delay - The number of ms allowed between invocations of the function
 * @returns {Function} The now throttle aware callback
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
 * @param {number} ms - The number of ms to await
 * @returns {Promise} A promise wrapped setTimeout
 */
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * async retry with delay
 * @param {Function} callback - The function to execute, and if it throws, to retry
 * @param {object} options -
 * @param {number|(index: number) => number} options.delay - The number of ms to await before executing a retry, if its a function it will provide the current retry index to calculate a dynamic sunset, Default: 500
 * @param {number} options.max - The max number of times to retry, Default: 3
 * @returns {any} The callback return
 */
export const retry = async (callback, options = {}) => {
	const { index = 0, max = 3 } = options;
	const delayMs = (typeof options.delay === 'function' ? options.delay(index) : options.delay) ?? 500;

	try {
		return callback();
	} catch (error) {
		// eslint-disable-next-line no-console
		if (process.env.NODE_ENV === 'development') console.warn('[DEV] retry error', error);

		if (index >= max) throw error;

		await delay(delayMs);

		return retry(callback, { ...options, index: index + 1 });
	}
};

/**
 * Convert a number from one range to another
 * @param {number} value - The number to convert
 * @param {Array} sourceRange - The range the value originates from
 * @param {Array} targetRange - The range to convert the value into
 * @returns {number} The original value converted into the target range
 */
export const convertRange = (value, sourceRange, targetRange) =>
	((value - sourceRange[0]) * (targetRange[1] - targetRange[0])) / (sourceRange[1] - sourceRange[0]) + targetRange[0];

/**
 * Retrieve a list of non-native properties from a javascript object
 * @param {object} object - The source object
 * @returns {[string]} An array of the string property names
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

/**
 * Build an array of items from a set of conditions and results
 * @param {object[]} conditionalItems -
 * @param {boolean} conditionalItems[].if - The condition
 * @param {any} conditionalItems[].thenItem - The item inserted into the result if the condition is true
 * @param {[any]} conditionalItems[].thenItems - An array of items spread into the result if the condition is true
 * @param {any} conditionalItems[].elseItem - The item inserted into the result if the condition is false
 * @param {[any]} conditionalItems[].elseItems - An array of items spread into the result if the condition is false
 * @param {any} conditionalItems[].alwaysItem - The item inserted into the result regardless of the condition
 * @param {[any]} conditionalItems[].alwaysItems - An array of items spread into the result regardless of the condition
 * @returns {Array} The array of items who's conditions resolved truthy
 */
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

/**
 * Build an array of items from a set of conditions and results
 * @param {object[]} orders -
 * @param {string} orders[].property - The property to sort
 * @param {'asc'|'desc'} orders[].direction - The direction to sort the property by
 * @returns {Function} A JS Array.sort function primed sort your data by the preceding order configurations
 */
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
