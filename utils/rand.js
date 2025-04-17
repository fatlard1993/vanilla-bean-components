/** @type {(min: number, max: number) => number} Generate a random number from a range (min inclusive, max exclusive) */
export const rand = (min = -999, max = 999) => Math.random() * (max - min) + min;

/** @type {(min: number, max: number) => number} Generate a random integer from a range (min & max inclusive) */
export const randInt = (min = -999, max = 999) => {
	min = Math.ceil(min);

	return Math.floor(Math.random() * (Math.floor(max) - min + 1) + min);
};

/** @type {(array: Array) => number} Choose a random item from an array */
export const randFromArray = array => array[randInt(0, array.length)];
