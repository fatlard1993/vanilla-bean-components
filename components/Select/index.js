import './index.css';

import DomElem from '../DomElem';

export class Select extends DomElem {
	constructor({ value = '', options = [], ...rest }) {
		const initialValue = value;

		super({
			tag: 'select',
			value,
			appendChildren: options.map(textContent => new DomElem({ tag: 'option', textContent })),
			...rest,
		});

		this.isDirty = () => initialValue !== this.value;
	}
}

export default Select;
