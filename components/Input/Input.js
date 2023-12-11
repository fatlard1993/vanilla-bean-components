import { styled } from '../../utils';
import { DomElem } from '../DomElem';

export const InputValidationError = styled(
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

export const updateValidationErrors = ({ elem, validations, value, clear }) => {
	if (!validations?.length) return;

	const errors = [];

	validations.forEach(([validation, message]) => {
		const isValid = clear || (validation instanceof RegExp ? validation.test(value) : validation(value));

		const resolvedMessage = typeof message == 'function' ? message(value) : message;

		const existingValidationError = document.evaluate(
			`//div[text()='${resolvedMessage}']`,
			elem.parentElement,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
		).singleNodeValue;

		if (!isValid) errors.push(resolvedMessage);

		if (existingValidationError) {
			existingValidationError.style.display = isValid ? 'none' : 'block';
		} else if (!isValid) {
			const validationError = new InputValidationError({ content: resolvedMessage });

			// Insert directly before the input element in case there is a label or other stacked elements
			elem.parentElement.insertBefore(validationError.elem, elem);
		}
	});

	return errors.length > 0 ? errors : undefined;
};

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
		return updateValidationErrors({ elem: this.elem, validations: this.options.validations, value: this.value, clear });
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
