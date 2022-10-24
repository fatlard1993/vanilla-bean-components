import { TinyColor } from '@ctrl/tinycolor';

export const stringToColor = (str, opts = { hue: [0, 360], sat: [75, 100], lit: [40, 60] }) => {
	if (!str) return new TinyColor.random().toRgbString();

	let h, s, l;

	const range = (hash, min, max) => {
		const diff = max - min;
		const x = ((hash % diff) + diff) % diff;

		return x + min;
	};

	let hash = 0;

	if (str.length === 0) return hash;

	for (let x = 0; x < str.length; ++x) {
		hash = str.charCodeAt(x) + ((hash << 5) - hash);
		hash &= hash;
	}

	h = range(hash, opts.hue[0], opts.hue[1]);
	s = range(hash, opts.sat[0], opts.sat[1]);
	l = range(hash, opts.lit[0], opts.lit[1]);

	return `hsl(${h}, ${s}%, ${l}%)`;
};
