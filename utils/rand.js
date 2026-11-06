/** @type {(min?: number, max?: number) => number} Generate a random number from a range (min inclusive, max exclusive) */
export const rand = (min = -999, max = 999) => Math.random() * (max - min) + min;

/** @type {(min?: number, max?: number) => number} Generate a random integer from a range (min & max inclusive), given either way round */
export const randInt = (min = -999, max = 999) => {
	const low = Math.ceil(Math.min(min, max));
	const high = Math.floor(Math.max(min, max));

	// Clamped: at the ends of the safe range the arithmetic rounds, and could land one past a bound
	return Math.min(high, Math.max(low, Math.floor(Math.random() * (high - low + 1) + low)));
};

/**
 * @template T
 * @type {<T>(array: Array<T>) => T} Choose a random item from an array
 */
export const randFromArray = array => array[randInt(0, array.length - 1)];

/** @type {(array: Array) => Array} Shuffle an array in place (Fisher-Yates), returning it */
export const shuffleArray = array => {
	for (let index = array.length - 1; index > 0; index--) {
		const swap = Math.floor(Math.random() * (index + 1));

		[array[index], array[swap]] = [array[swap], array[index]];
	}

	return array;
};
