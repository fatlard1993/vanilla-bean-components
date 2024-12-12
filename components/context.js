import { context as component } from '../Component';

import Context from '../Context';
import theme from '../theme';

component.theme = theme;

const context = new Context({
	component,
});

export default context;
