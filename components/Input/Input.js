import { styled } from '../../utils';
import DomElem from '../DomElem';
import { LabelSupport } from '../Label';

const InputValidationError = styled(
	DomElem,
	({ colors }) => `
		background-color: ${colors.red};
		padding: 6px;
		margin: 3px;
		border-radius: 3px;
	`,
);

export class Input extends LabelSupport {
	constructor({ styles = () => '', value = '', ...options }) {
		const initialValue = value;

		super({
			styles: theme => `
				${theme.input}

				${styles(theme)}
			`,
			tag: 'input',
			value,
			...options,
		});

		this.initialValue = initialValue;
	}

	get value() {
		return this.elem.value;
	}

	set value(value) {
		this.elem.value = value;
	}

	get isDirty() {
		return this.initialValue !== this.value;
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
				this.validationErrors[message] = new InputValidationError({
					content: resolvedMessage,
				});

				this.elem.parentElement.insertBefore(this.validationErrors[message].elem, this.elem);
			}
		});

		return errors;
	}
}

export default Input;
