/**
 * Convert any number of strings or arrays into a single array with no duplicates
 * @return {Array} classList
 */
export const buildClassList = (...classNames) => [
	...new Set(
		classNames.flat(Number.Infinity).filter(className => typeof className === 'string' && className.length > 0),
	),
];

/**
 * Convert any number of strings or arrays into a single space delineated string with no duplicates
 * @return {String} className
 */
export const buildClassName = (...classNames) => buildClassList(...classNames).join(' ');
