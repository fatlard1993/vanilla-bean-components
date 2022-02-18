import './index.css';

import DomElem from '../DomElem';

export default class Select extends DomElem {
	constructor({ value = '', className, options = [], ...rest }) {
		const initialValue = value;

		super('select', {
			value,
			className: ['select', className],
			appendChildren: options.map(textContent => new DomElem('option', { textContent })),
			...rest,
		});

		this.isDirty = () => initialValue !== this.value;

		return this;
	}
}
