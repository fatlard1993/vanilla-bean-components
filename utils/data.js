/**
 * Creates debounced version of function that delays execution until after delay period of inactivity.
 * @param {Function} callback - Function to debounce
 * @param {number} [delay] - Milliseconds to delay after last invocation
 * @returns {Function} Debounced function that cancels previous invocations
 */
export const debounce = (callback, delay = 400) => {
	let timerId;

	return (...args) => {
		clearTimeout(timerId);

		timerId = setTimeout(() => callback(...args), delay);
	};
};

/**
 * Creates throttled version of function that limits execution to once per delay period.
 * @param {Function} callback - Function to throttle
 * @param {number} [delay] - Minimum milliseconds between function invocations
 * @returns {Function} Throttled function that enforces rate limiting
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
 * Creates promise that resolves after specified delay.
 * @param {number} ms - Milliseconds to delay before promise resolution
 * @returns {Promise<void>} Promise that resolves after delay period
 */
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes function with automatic retry on failure, with configurable delay and attempt limits.
 * @param {Function} callback - Function to execute and retry on failure
 * @param {object} [options] - Retry configuration
 * @param {number|Function} [options.delay] - Delay in milliseconds between retries, or function receiving attempt index
 * @param {number} [options.max] - Maximum number of retry attempts
 * @param {number} [options.index] - Internal retry counter, do not provide
 * @returns {Promise<*>} Promise resolving to callback return value
 * @throws {Error} Final error if all retry attempts fail
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
 * Converts number from source range to equivalent value in target range using linear interpolation.
 * @param {number} value - Number to convert between ranges
 * @param {[number, number]} sourceRange - Source range as [min, max] array
 * @param {[number, number]} targetRange - Target range as [min, max] array
 * @returns {number} Value converted to target range maintaining proportional position
 */
export const convertRange = (value, sourceRange, targetRange) =>
	((value - sourceRange[0]) * (targetRange[1] - targetRange[0])) / (sourceRange[1] - sourceRange[0]) + targetRange[0];

/**
 * Extracts non-native property names from object and its prototype chain.
 *
 * Filters out built-in JavaScript object methods and properties like constructor,
 * toString, hasOwnProperty, etc.
 * @param {object} object - Object to extract custom properties from
 * @returns {string[]} Array of custom property names excluding native methods
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
 * Builds array from conditional item descriptors, supporting conditional inclusion and arrays.
 * @param {object[]} conditionalItems - Array of conditional item descriptors
 * @param {boolean} conditionalItems[].if - Condition determining item inclusion
 * @param {*} [conditionalItems[].thenItem] - Single item added when condition is true
 * @param {*[]} [conditionalItems[].thenItems] - Array of items spread when condition is true
 * @param {*} [conditionalItems[].elseItem] - Single item added when condition is false
 * @param {*[]} [conditionalItems[].elseItems] - Array of items spread when condition is false
 * @param {*} [conditionalItems[].alwaysItem] - Single item always added regardless of condition
 * @param {*[]} [conditionalItems[].alwaysItems] - Array of items always spread regardless of condition
 * @returns {*[]} Flattened array of items matching their conditions
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
 * Creates multi-level sorting function for Array.sort() with locale-aware comparison.
 * @param {object|object[]} orders - Sort configuration, single object or array for multi-level sorting
 * @param {string} [orders.property] - Object property to sort by, undefined sorts primitive values directly
 * @param {'asc'|'desc'} [orders.direction] - Sort direction: ascending or descending
 * @returns {Function} Comparator function for Array.sort() with multi-level sorting support
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
