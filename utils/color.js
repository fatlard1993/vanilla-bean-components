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

export const deltaE = (rgbA, rgbB) => {
	const labA = rgb2lab(rgbA);
	const labB = rgb2lab(rgbB);
	const deltaL = labA[0] - labB[0];
	const deltaA = labA[1] - labB[1];
	const deltaB = labA[2] - labB[2];
	const c1 = Math.hypot(labA[1], labA[2]);
	const c2 = Math.hypot(labB[1], labB[2]);
	const deltaC = c1 - c2;
	let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
	deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
	const sh = 1 + 0.015 * c1;

	/* eslint-disable spellcheck/spell-checker */
	const sc = 1 + 0.045 * c1;
	const deltaLKlsl = deltaL / 1;
	const deltaCkcsc = deltaC / sc;
	const deltaHkhsh = deltaH / sh;
	const index = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
	/* eslint-enable spellcheck/spell-checker */

	return index < 0 ? 0 : Math.sqrt(index);
};

export const rgb2lab = rgb => {
	let r = rgb[0] / 255,
		g = rgb[1] / 255,
		b = rgb[2] / 255,
		x,
		y,
		z;
	r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
	g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
	b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
	x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
	y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1;
	z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
	x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
	return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
