import './index.css';

import DomElem from '../DomElem';

export class Link extends DomElem {
	constructor(options) {
		super({ tag: 'a', ...options });
	}
}

export default Link;
