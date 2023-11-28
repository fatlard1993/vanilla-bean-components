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

const type_enum = Object.freeze([
	'button',
	'checkbox',
	'color',
	'date',
	'datetime-local',
	'email',
	'file',
	'hidden',
	'image',
	'month',
	'number',
	'password',
	'radio',
	'range',
	'reset',
	'search',
	'submit',
	'tel',
	'text',
	'time',
	'url',
	'week',
]);
const defaultOptions = { tag: 'input', value: '', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off' };

class Input extends DomElem {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };
	type_enum = type_enum;

	constructor(options = {}, ...children) {
		super(
			{
				...((options.tag || 'input') === 'input' ? { type: 'text' } : {}),
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

	setOption(key, value) {
		super.setOption(key, value);

		if (this.rendered && key === 'value') this.validate();
	}

	get value() {
		return this.elem.value;
	}

	set value(newValue) {
		this.elem.value = newValue;
	}

	get isDirty() {
		return this.initialValue !== this.value;
	}

	validate({ clear } = {}) {
		if (!this.options.validations?.length) return;

		this.validationErrors = this.validationErrors || {};

		const errors = [];

		this.options.validations.forEach(([validation, message]) => {
			const isValid = clear || (validation instanceof RegExp ? validation.test(this.value) : validation(this.value));

			const resolvedMessage = typeof message == 'function' ? message(this.value) : message;

			if (!isValid) errors.push(resolvedMessage);

			if (this.validationErrors[message]) {
				this.validationErrors[message].elem.style.display = isValid ? 'none' : 'block';
			} else if (!isValid) {
				this.validationErrors[message] = new InputValidationError({ content: resolvedMessage });

				// Insert directly before the input element in case there is a label or other stacked elements
				this.elem.parentElement.insertBefore(this.validationErrors[message].elem, this.elem);
			}
		});

		return errors.length > 0 ? errors : undefined;
	}

	onInput(callback) {
		const wrappedCallback = event => {
			event.value = event.target.value || this.value;

			callback(event);
		};

		this.elem.addEventListener('input', wrappedCallback);

		return () => this.elem.removeEventListener('input', wrappedCallback);
	}
}

export default Input;
