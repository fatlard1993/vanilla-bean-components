import './index.css';

import DomElem from '../DomElem';

export default class NumberInput extends DomElem {
	constructor({ className, value, ...rest }) {
		const initialValue = value;

		super('input', { type: 'number', className: ['numberInput', className], value, ...rest });

		this.isDirty = () => initialValue !== this.value;
	}
}
