import './index.css';

import DomElem from '../DomElem';

export class Input extends DomElem {
	constructor({ value = '', ...options }) {
		const initialValue = value;

		super({ tag: 'input', value, ...options });

		this.isDirty = () => initialValue !== this.elem.value;
	}

	validate() {
		if (!this.options.validations?.length) return;

		this.validationErrors = this.validationErrors || {};

		const errors = [];

		this.options.validations.forEach(([validation, message]) => {
			const isValid = validation.test(this.elem.value);

			if (!isValid) errors.push(message);

			if (this.validationErrors[message]) {
				this.validationErrors[message].elem.style.display = isValid ? 'none' : 'block';
			} else if (!isValid) {
				this.validationErrors[message] = new DomElem({
					textContent: message,
					className: 'validationError',
				});

				this.elem.parentElement.insertBefore(this.validationErrors[message].elem, this.elem);
			}
		});

		return errors;
	}
}

export default Input;
