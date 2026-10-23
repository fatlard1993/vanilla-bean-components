import colors from './colors';
import focusRing from './focus';
import fonts from './fonts';
import _input from './input';
import _page, { elements as _elements } from './page';
import safeArea from './safeArea';
import { elevation, media, radius, space } from './tokens';

const theme = {
	colors,
	fonts,
	safeArea,
	space,
	radius,
	media,
	elevation,
	/**
	 * The focus ring's declarations, for under :focus-visible
	 * @param {string} [offset] - How far outside the edge it sits; negative for inside
	 * @returns {string} CSS
	 */
	focusRing: offset => focusRing(theme, offset),
	get input() {
		return _input(this);
	},
	get page() {
		return _page(this);
	},
	get elements() {
		return _elements(this);
	},
};

export default theme;
