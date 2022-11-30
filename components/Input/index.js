import DomElem from '../DomElem';
import Label from '../Label';

export class Input extends DomElem {
	constructor({ styles = () => '', value = '', label, appendTo, appendChild, appendChildren, ...options }) {
		const initialValue = value;
		const children = [
			...(appendChildren ? (Array.isArray(appendChildren) ? appendChildren : [appendChildren]) : []),
			...(appendChild ? [appendChild] : []),
		];

		super({
			styles: theme => `
				${theme.input}

				${styles(theme)}
			`,
			tag: 'input',
			value,
			appendTo,
			appendChildren: label ? undefined : children,
			...options,
		});

		this.initialValue = initialValue;
		this.isDirty = () => initialValue !== this.value;

		if (label) {
			this.label = new Label({
				...(typeof label === 'object' ? label : { label }),
				appendTo,
				appendChildren: [this.elem, ...children],
			});
		}
	}

	get value() {
		return this.elem.value;
	}

	set value(value) {
		this.elem.value = value;
	}

	validate() {
		if (!this.options.validations?.length) return;

		this.validationErrors = this.validationErrors || {};

		const errors = [];

		this.options.validations.forEach(([validation, message]) => {
			const isValid = validation instanceof RegExp ? validation.test(this.elem.value) : validation(this.elem.value);

			const resolvedMessage = typeof message == 'function' ? message(this.elem.value) : message;

			if (!isValid) errors.push(resolvedMessage);

			if (this.validationErrors[message]) {
				this.validationErrors[message].elem.style.display = isValid ? 'none' : 'block';
			} else if (!isValid) {
				this.validationErrors[message] = new DomElem({
					styles: ({ colors }) => `
						background-color: ${colors.red};
						padding: 6px;
						margin: 3px;
						border-radius: 3px;
					`,
					textContent: resolvedMessage,
					className: 'validationError',
				});

				this.elem.parentElement.insertBefore(this.validationErrors[message].elem, this.elem);
			}
		});

		return errors;
	}
}

export default Input;
