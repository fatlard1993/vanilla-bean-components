import './index.css';

import DomElem from '../DomElem';

export class Link extends DomElem {
	constructor({ className, ...rest }) {
		super('a', { className: ['link', className], ...rest });
	}
}

export default Link;
