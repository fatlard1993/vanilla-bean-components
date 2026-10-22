import colors from './colors';
import fonts from './fonts';
import _input from './input';
import _page, { elements as _elements } from './page';
import safeArea from './safeArea';
import { media, radius, space } from './tokens';

const theme = {
	colors,
	fonts,
	safeArea,
	space,
	radius,
	media,
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
