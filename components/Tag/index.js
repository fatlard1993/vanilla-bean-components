import './index.css';

import DomElem from '../DomElem';

export class Tag extends DomElem {
	constructor({ appendTo, readOnly = false, ...options }) {
		super({
			tag: 'li',
			appendTo,
			onPointerPressAndHold: readOnly ? () => {} : () => this.remove(),
			...options,
		});
	}
}

export default Tag;
