import { context as domElem } from '../DomElem';

import { Context } from '../utils';
import theme from '../theme';

domElem.theme = theme;

const context = new Context({
	domElem,
});

export default context;
