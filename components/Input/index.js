import './index.css';

import DomElem from '../DomElem';
import Label from '../Label';

export class Input extends DomElem {
	constructor({ value = '', label, appendTo, appendChild, appendChildren, ...options }) {
		const initialValue = value;
		const children = [
			...(appendChildren ? (Array.isArray(appendChildren) ? appendChildren : [appendChildren]) : []),
			...(appendChild ? [appendChild] : []),
		];

		super({ tag: 'input', value, appendTo, appendChildren: label ? undefined : children, ...options });

		this.isDirty = () => initialValue !== this.elem.value;

		if (label) {
			this.label = new Label({
				label,
				appendTo,
				appendChildren: [this.elem, ...children],
			});
		}
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
