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

		this.options.validations.forEach(([validation, message]) => {
			const isValid = validation.test(this.elem.value);

			console.log({ validation, message, isValid, value: this.elem.value, elem: this.validationErrors[message] });

			if (this.validationErrors[message]) {
				this.validationErrors[message].elem.style.display = isValid ? 'none' : 'block';
			} else if (!isValid) {
				this.validationErrors[message] = new DomElem({
					textContent: message,
					prependTo: this.elem.parentElement,
					className: 'validationError',
				});
			}
		});
	}
}

export default Input;
