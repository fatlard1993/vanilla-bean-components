import { TinyColor } from '@ctrl/tinycolor';

/**
 * Create a hsl color string using a string as the seed
 * @param {String} string - The string to use as the color seed
 * @param {Object} options - Min/Max constraints for the color
 * @return {String} hsl color string
 */
export const stringToColor = (string, config = {}) => {
	const { h, s, l } = { h: [0, 360], s: [75, 100], l: [40, 60], ...config };

	if (!string) return new TinyColor.random().toRgbString();

	const range = (hash, min, max) => {
		const diff = max - min;
		const x = ((hash % diff) + diff) % diff;

		return x + min;
	};

	let hash = 0;

	if (string.length === 0) return hash;

	for (let x = 0; x < string.length; ++x) {
		hash = string.codePointAt(x) + ((hash << 5) - hash);
		hash &= hash;
	}

	return `hsl(${range(hash, h[0], h[1])}, ${range(hash, s[0], s[1])}%, ${range(hash, l[0], l[1])}%)`;
};
