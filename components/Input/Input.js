import { Component } from '../../Component';
import { updateValidationErrors, insertTabCharacter, adjustIndentation } from './utils';

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
	placeholder: '',
};

const dataTypeToInputType = { number: 'number', boolean: 'checkbox', string: 'text' };

export default class Input extends Component {
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

	render() {
		super.render();

		if (this.tag === 'textarea' && this.options.syntaxHighlighting) {
			this.elem.addEventListener('keydown', function (event) {
				if (event.key == 'Tab') {
					event.preventDefault();

					this.selectionStart === this.selectionEnd && !event.shiftKey
						? insertTabCharacter(this)
						: adjustIndentation({ textarea: this, action: event.shiftKey ? 'remove' : 'add' });
				}
			});
		}
	}

	setOption(key, value) {
		if (key === 'height' && this.tag === 'textarea') {
			if (value === 'auto') {
				this.__updateAutoHeight = () => {
					this.elem.style.height = this.options.syntaxHighlighting
						? `calc((${((this.elem.value?.match(/\n/g) || '').length + 1) * 1.19}em + 10px)`
						: `calc((${((this.elem.value?.match(/\n/g) || '').length + 1) * 1.25}em + 16px)`;
				};

				this.__updateAutoHeight();

				this.elem.addEventListener('input', this.__updateAutoHeight);
			} else {
				this.elem.removeEventListener('input', this.__updateAutoHeight);

				this.elem.style.height = typeof value === 'number' ? `${value + 1}em` : value;
			}
		} else if (key === 'value' && this.options.type === 'checkbox') this.elem.checked = value;
		else if (key === 'syntaxHighlighting') this[value ? 'addClass' : 'removeClass']('syntaxHighlighting');
		else if (key === 'language' && this.options.syntaxHighlighting) {
			this.removeClass(/\blanguage-\S+\b/g);
			this.addClass(`language-${value}`);
		} else super.setOption(key, value);

		if (this.rendered && key === 'value') this.validate();
	}

	get isDirty() {
		return this.initialValue !== this.options.value;
	}

	validate({ validations, value } = {}) {
		const errors = updateValidationErrors({
			elem: this.elem,
			validations: validations ?? this.options.validations,
			value: value ?? this.options.value,
		});

		this[errors ? 'addClass' : 'removeClass']('validationErrors');

		return errors;
	}
}
