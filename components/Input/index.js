import './index.css';

import DomElem from '../DomElem';

export class Input extends DomElem {
	constructor({ value = '', ...options }) {
		const initialValue = value;

		super({ tag: 'input', value, ...options });

		this.isDirty = () => initialValue !== this.elem.value;
	}
}

export default Input;
