import './index.css';

import Popover from '../Popover';

export class Menu extends Popover {
	constructor({ className, ...rest }) {
		super({ className: ['menu', className], ...rest });
	}
}

export default Menu;
