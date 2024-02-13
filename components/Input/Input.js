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
const defaultOptions = {
	tag: 'input',
	value: '',
	autocomplete: 'off',
	autocapitalize: 'off',
	autocorrect: 'off',
	height: 'auto',
};

export const updateValidationErrors = ({ elem, validations, value }) => {
	if (!validations?.length) return;

	const errors = [];

	validations.forEach(([validation, message]) => {
		const isValid = validation instanceof RegExp ? validation.test(value) : validation(value);

		const resolvedMessage = typeof message == 'function' ? message(value) : message;

		const existingValidationError = document.evaluate(
			`..//div[text()='${resolvedMessage}']`,
			elem,
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

const dataTypeToInputType = { number: 'number', boolean: 'checkbox', string: 'text' };

class Input extends DomElem {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };
	type_enum = type_enum;

	constructor(options = {}, ...children) {
		super(
			{
				...((options.tag || 'input') === 'input' ? { type: dataTypeToInputType[typeof options.value] || 'text' } : {}),
				...defaultOptions,
				...options,
			},
			...children,
		);

		this.initialValue = this.options.value;
	}

	setOption(key, value) {
		if (key === 'height' && this.tag === 'textarea') {
			if (value === 'auto') {
				this.__updateAutoHeight = () => {
					this.elem.style.height = `${(this.elem.value?.match(/\n/g) || '').length + 2}em`;
				};

				this.__updateAutoHeight();

				this.elem.addEventListener('input', this.__updateAutoHeight);
			} else {
				this.elem.removeEventListener('input', this.__updateAutoHeight);

				this.elem.style.height = typeof value === 'number' ? `${value + 1}em` : value;
			}
		} else super.setOption(key, value);

		if (this.rendered && key === 'value') this.validate();
	}

	get isDirty() {
		return this.initialValue !== this.options.value;
	}

	validate({ validations, value } = {}) {
		return updateValidationErrors({
			elem: this.elem,
			validations: validations ?? this.options.validations,
			value: value ?? this.options.value,
		});
	}
}

export default Input;
