import { customAlphabet } from 'nanoid';

/**
 * Generate secure unique ID that is safe to use as a class name or id
 * @param {number} size - The size of the ID. The default size is 10
 * @returns {string} Random id string
 */
export const classSafeNanoid = (size = 10) =>
	// eslint-disable-next-line spellcheck/spell-checker
	customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', size)();

/**
 * Convert any number of strings or arrays into a single array with no duplicates
 * @param {...any} classNames - strings or arrays of strings
 * @returns {Array} classList
 */
export const buildClassList = (...classNames) => [
	...new Set(
		classNames
			.flat(Number.POSITIVE_INFINITY)
			.filter(className => typeof className === 'string' && className.length > 0 && !/^\s+$/.test(className)),
	),
];

/**
 * Convert any number of strings or arrays into a single space delineated string with no duplicates
 * @param {...any} classNames - strings or arrays of strings
 * @returns {string} className
 */
export const buildClassName = (...classNames) => buildClassList(...classNames).join(' ');
