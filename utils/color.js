export const randomRGB = () => {
	return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

export const hsvToRGB = ({ h, s, v }) => {
	let R, G, B, X, C;

	h = (h % 360) / 60;

	C = v * s;
	X = C * (1 - Math.abs((h % 2) - 1));
	R = G = B = v - C;

	h = ~~h;
	R += [C, X, 0, 0, X, C][h];
	G += [X, C, C, X, 0, 0][h];
	B += [0, 0, X, C, C, X][h];

	return `rgb(${Math.floor(R * 255)}, ${Math.floor(G * 255)}, ${Math.floor(B * 255)})`;
};

export const toHSV = color => {
	let result;

	if (color[0] === '#' && (color.length === 4 || color.length === 7)) {
		if (color.length === 4) {
			color =
				'#' +
				color.substr(1, 1) +
				color.substr(1, 1) +
				color.substr(2, 2) +
				color.substr(2, 2) +
				color.substr(3, 3) +
				color.substr(3, 3);
		}

		result = rgbToHSV(
			parseInt(color.substr(1, 2), 16),
			parseInt(color.substr(3, 2), 16),
			parseInt(color.substr(5, 2), 16),
		);
	} else {
		color = color.split(/a?\(|\)|,\s?/gi);

		const type = color.shift().toLowerCase();
		const transform = {
			hslToHSV,
			rgbToHSV,
		};

		color.length = 3;

		for (let x = 0; x < color.length; ++x) color[x] = parseInt(color[x]) || 0;

		if (transform[type + 'ToHSV']) result = transform[type + 'ToHSV'].apply(null, color);
	}

	return result || toHSV(randomRGB());
};

export const hslToHSV = (hue, sat, light) => {
	sat /= 100;
	light /= 100;

	sat *= light < 0.5 ? light : 1 - light;

	return { h: hue, s: (2 * sat) / (light + sat), v: light + sat };
};

export const rgbToHSV = (red, green, blue) => {
	red /= 255;
	green /= 255;
	blue /= 255;

	let hue, sat, value, C;

	value = Math.max(red, green, blue);
	C = value - Math.min(red, green, blue);

	hue =
		C === 0
			? null
			: value === red
			? (green - blue) / C + (green < blue ? 6 : 0)
			: value === green
			? (blue - red) / C + 2
			: (red - green) / C + 4;
	hue = (hue % 6) * 60;
	sat = C === 0 ? 0 : C / value;

	return { h: hue, s: sat, v: value };
};

export const decToRGB = dec => {
	dec = Number(dec);

	return `rgb(${dec & 0x0000ff}, ${(dec & 0x00ff00) >> 8}, ${(dec & 0xff0000) >> 16})`;
};

export const stringToColor = (str, opts) => {
	if (!str) return randomRGB();

	let h, s, l;
	opts = opts || {};
	opts.hue = opts.hue || [0, 360];
	opts.sat = opts.sat || [75, 100];
	opts.lit = opts.lit || [40, 60];

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

export const getOppositeHue = base =>
	`hsl(${(parseInt(base.slice(4, base.length).replace(/,.*/, '')) + 180) % 360}, 100%, 30%)`;
