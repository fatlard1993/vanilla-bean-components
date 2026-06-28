import _button from './button';
import _code from './code';
import colors from './colors';
import fonts from './fonts';
import _input from './input';
import _page from './page';
import _scrollbar from './scrollbar';
import _table from './table';

const theme = {
	colors,
	fonts,
	get button() {
		return _button(this);
	},
	get code() {
		return _code(this);
	},
	get input() {
		return _input(this);
	},
	get scrollbar() {
		return _scrollbar(this);
	},
	get table() {
		return _table(this);
	},
	get page() {
		return _page(this);
	},
};

export default theme;
