/** @type {(min: number, max: number) => number} Generate a random number from a range (inclusive) */
export const rand = (min = -999, max = 999) => Math.random() * (max - min) + min;

/** @type {(min: number, max: number) => number} Generate a random integer from a range (inclusive) */
export const randInt = (min, max) => Number.parseInt(rand(min, max));

/** @type {(array: Array) => number} Choose a random item from an array */
export const randFromArray = array => array[randInt(0, array.length)];
