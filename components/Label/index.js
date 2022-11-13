import './index.css';

import DomElem from '../DomElem';

export class Label extends DomElem {
	constructor({ label, appendChild, appendChildren, ...options }) {
		super({
			appendChildren: [
				new DomElem({ className: 'label-text', textContent: label }),
				...(appendChildren ? (Array.isArray(appendChildren) ? appendChildren : [appendChildren]) : []),
				...(appendChild ? [appendChild] : []),
			],
			...options,
		});
	}
}

export default Label;
