export const capitalize = (str, recursive, split = ' ') => {
	const words = str.split(split);
	const wordCount = words.length;

	for (let x = 0, word; x < (recursive ? wordCount : 1); ++x) {
		word = words[x];

		words[x] = word.charAt(0).toUpperCase() + word.slice(1);
	}

	return words.join(split);
};

export const fromCamelCase = (string, joiner = ' ') => {
	return string.split(/(?=[A-Z][a-z])/).join(joiner);
};

export const toCamelCase = (string, upperCamelCase = false, splitter = ' ') => {
	return string
		.split(splitter)
		.map((item, index) => {
			return (index === 0 && upperCamelCase) || index > 0 ? capitalize(item) : item;
		})
		.join('');
};
