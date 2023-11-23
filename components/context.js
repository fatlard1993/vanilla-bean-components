import domElem from '../DomElem/context';

import { Context } from '../utils';
import theme from '../theme';

domElem.theme = theme;

const context = new Context({
	domElem,
});

export default context;
