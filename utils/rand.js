/** @type {(min: number, max: number) => number} Generate a random number from a range (min inclusive, max exclusive) */
export const rand = (min = -999, max = 999) => Math.random() * (max - min) + min;

/** @type {(min: number, max: number) => number} Generate a random integer from a range (min & max inclusive) */
export const randInt = (min = -999, max = 999) => {
	min = Math.ceil(min);

	return Math.floor(Math.random() * (Math.floor(max) - min + 1) + min);
};

/** @type {(array: Array) => number} Choose a random item from an array */
export const randFromArray = array => array[randInt(0, array.length - 1)];

/** @type {(array: Array) => Array} Shuffle an array in place (Fisher-Yates), returning it */
export const shuffleArray = array => {
	for (let index = array.length - 1; index > 0; index--) {
		const swap = Math.floor(Math.random() * (index + 1));

		[array[index], array[swap]] = [array[swap], array[index]];
	}

	return array;
};

/** @type {(percentage?: number) => boolean} True `percentage` percent of the time */
export const chance = (percentage = 50) => Math.random() * 100 < percentage;

/**
 * Pick a key, each as likely as its percentage
 * @example weightedChance({ common: 70, rare: 25, legendary: 5 }); // 'common' 70% of the time
 * @param {object} percentages - Keys to their chance, summing to 100
 * @returns {string} The key picked
 */
export const weightedChance = percentages => {
	const entries = Object.entries(percentages);
	const total = entries.reduce((sum, [, percentage]) => sum + percentage, 0);

	if (total !== 100)
		throw new Error(`weightedChance percentages sum to ${total}, not 100: ${Object.keys(percentages)}`);

	let roll = Math.random() * 100;

	for (const [key, percentage] of entries) {
		roll -= percentage;

		if (roll < 0) return key;
	}

	return entries.findLast(([, percentage]) => percentage > 0)[0];
};
