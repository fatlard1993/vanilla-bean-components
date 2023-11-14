/**
 * Capitalize the string
 * @param {String} string - The source string
 * @param {Boolean} recursive - Weather or not to recurse over every word in the string
 * @param {String} split - The string used to split apart the source string (if using recursive)
 * @return {String} The capitalized string
 */
export const capitalize = (string, recursive, split = ' ') => {
	const words = string.split(split);
	const wordCount = words.length;

	for (let x = 0, word; x < (recursive ? wordCount : 1); ++x) {
		word = words[x];

		words[x] = word.charAt(0).toUpperCase() + word.slice(1);
	}

	return words.join(split);
};

// const capitalize2 = (string = '') => {
// 	return string.length ? `${string[0].toUpperCase()}${string.slice(1)}` : '';
// };

// const capitalizeAll = (string, wordDelimiter = ' ') => {
// 	return string.split(wordDelimiter).map(capitalize).join(wordDelimiter);
// };

/**
 * Convert a camelCase or PascalCase string with a custom joiner
 * @param {String} string - The source string
 * @param {String} joiner - The string used to re-join the words
 * @return {String} The re-formatted string
 */
export const fromCamelCase = (string, joiner = ' ') => {
	return string.split(/(?=[A-Z][a-z])/).join(joiner);
};

/**
 * Convert a custom split string to a camelCase or PascalCase string with a custom joiner
 * @param {String} string - The source string
 * @param {Boolean} pascalCase - Output Pascal case instead of camelCase
 * @param {String} splitter - The string used to split the source into words
 * @return {String} The re-formatted string
 */
export const toCamelCase = (string, splitter = ' ') => {
	return string
		.split(splitter)
		.map((item, index) => (index > 0 ? capitalize(item) : item))
		.join('');
};

// const toPascalCase = (string = '') => capitalize(toCamelCase(string));
