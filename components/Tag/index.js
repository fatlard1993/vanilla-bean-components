import './index.css';

import DomElem from '../DomElem';

export class Tag extends DomElem {
	constructor({ appendTo, readOnly = false, className, tag, ...rest }) {
		super('li', {
			className: ['tag', className],
			appendTo,
			textContent: tag,
			onPointerPressAndHold: readOnly ? () => {} : () => this.remove(),
			...rest,
		});
	}
}

export default Tag;
