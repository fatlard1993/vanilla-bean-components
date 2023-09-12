import { styled } from '../../utils';
import { DomElem } from '../DomElem';

const InputValidationError = styled(
	DomElem,
	({ colors }) => `
		background-color: ${colors.red};
		padding: 6px;
		margin: 3px;
		border-radius: 3px;
	`,
);

const defaultOptions = { tag: 'input', value: '', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off' };

class Input extends DomElem {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				styles: (theme, domElem) => `
				${theme.input}

				${options.styles?.(theme, domElem) || ''}
			`,
			},
			...children,
		);

		this.initialValue = this.options.value;
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
					append: resolvedMessage,
				});

				this.elem.parentElement.insertBefore(this.validationErrors[message].elem, this.elem);
			}
		});

		return errors;
	}
}

export default Input;
