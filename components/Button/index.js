import './index.css';

import DomElem from '../DomElem';

export class Button extends DomElem {
	constructor(options) {
		super({ tag: 'button', ...options });
	}
}

export default Button;
