/**
 * Capitalize the string
 * @param {string} string - The source string
 * @param {boolean} recursive - Weather or not to recurse over every word in the string
 * @param {string} split - The string used to split apart the source string (if using recursive)
 * @returns {string} The capitalized string
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

/**
 * Reformat a camelCase or PascalCase string with a custom joiner
 * @param {string} string - The source string
 * @param {string} joiner - The string used to re-join the words
 * @returns {string} The re-formatted string
 */
export const fromCamelCase = (string, joiner = ' ') => {
	return string.split(/(?=[A-Z][a-z])/).join(joiner);
};

/**
 * Reformat string to a camelCase
 * @param {string} string - The source string
 * @param {string} splitter - The string used to split the source into words
 * @returns {string} The re-formatted string
 */
export const toCamelCase = (string, splitter = ' ') => {
	return (string.charAt(0).toLowerCase() + string.slice(1))
		.split(splitter)
		.map((item, index) => (index > 0 ? capitalize(item) : item))
		.join('');
};

/**
 * Reformat string to a PascalCase
 * @param {string} string - The source string
 * @returns {string} The re-formatted string
 */
export const toPascalCase = (string = '') => capitalize(toCamelCase(string));

/**
 * Strip all excess newline and indentation whitespace from the source string
 * @param {string} string - The source string
 * @returns {string} The re-formatted string
 */
export const removeExcessIndentation = string => {
	if (!string.includes('\t')) return string;
	if (!string.includes('\n')) return string.replace(/^\t+/, '');

	const lines = string.split('\n');

	const minIndentation = lines
		.map(line => line.match(/^\t+/) || [])
		.reduce((a, b) => {
			if (!a?.length) return b;
			if (!b?.length) return a;

			return a.length <= b.length ? a : b;
		});

	return lines.join('\n').replaceAll(new RegExp(`^${minIndentation}`, 'gm'), '');
};
