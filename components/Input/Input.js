import { Component } from '../../Component';
import { retry } from '../../utils';
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

/**
 * Versatile input component supporting all HTML input types and textarea functionality.
 *
 * Provides enhanced input behavior with auto-height for textareas, syntax highlighting,
 * validation support, and automatic type detection based on value type.
 * @param {object} [options={}] - Input configuration options
 * @param {string} [options.tag='input'] - HTML tag ('input' or 'textarea')
 * @param {string} [options.type] - Input type, auto-detected from value type if not specified
 * @param {*} [options.value=''] - Initial input value
 * @param {string} [options.placeholder=''] - Placeholder text
 * @param {string} [options.autocomplete='off'] - Autocomplete behavior
 * @param {string} [options.autocapitalize='off'] - Auto-capitalization behavior
 * @param {string} [options.autocorrect='off'] - Auto-correction behavior
 * @param {string|number} [options.height='auto'] - Height for textarea ('auto' for dynamic sizing)
 * @param {boolean} [options.syntaxHighlighting] - Enable syntax highlighting for textarea
 * @param {string} [options.language] - Programming language for syntax highlighting
 * @param {Array<Function>} [options.validations] - Array of validation functions
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Input} Input component instance
 */
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

	build() {
		if (this.tag === 'textarea' && this.options.syntaxHighlighting) {
			const handleKeydown = function (event) {
				if (event.key == 'Tab') {
					event.preventDefault();

					this.selectionStart === this.selectionEnd && !event.shiftKey
						? insertTabCharacter(this)
						: adjustIndentation({ textarea: this, action: event.shiftKey ? 'remove' : 'add' });
				}
			};

			this.elem.addEventListener('keydown', handleKeydown);
			this.replaceCleanup('syntaxHighlightingKeydown', () => this.elem.removeEventListener('keydown', handleKeydown));
		}
	}

	_setOption(key, value) {
		if (key === 'height' && this.tag === 'textarea') {
			if (value === 'auto') {
				this.__updateAutoHeight = () => {
					this.elem.style.height = this.options.syntaxHighlighting
						? `calc(${((this.elem.value?.match(/\n/g) || '').length + 1) * 1.19}em + 10px)`
						: `calc(${((this.elem.value?.match(/\n/g) || '').length + 1) * 1.25}em + 16px)`;
				};

				// Create debounced version for input events
				this.__debouncedUpdateAutoHeight =
					this.__debouncedUpdateAutoHeight ||
					(() => {
						clearTimeout(this.__autoHeightTimeout);
						this.__autoHeightTimeout = setTimeout(this.__updateAutoHeight, 16); // ~60fps
					});

				this.__updateAutoHeight();

				this.elem.addEventListener('input', this.__debouncedUpdateAutoHeight);

				// Add cleanup for timeout
				this.replaceCleanup('autoHeight', () => {
					clearTimeout(this.__autoHeightTimeout);
					this.elem.removeEventListener?.('input', this.__debouncedUpdateAutoHeight);
				});
			} else {
				this.elem.removeEventListener('input', this.__debouncedUpdateAutoHeight);
				clearTimeout(this.__autoHeightTimeout);

				this.elem.style.height = typeof value === 'number' ? `${value + 1}em` : value;
			}
		} else if (key === 'value' && this.options.type === 'checkbox') this.elem.checked = value;
		else if (key === 'syntaxHighlighting') this[value ? 'addClass' : 'removeClass']('syntaxHighlighting');
		else if (key === 'language' && this.options.syntaxHighlighting) {
			this.removeClass(/\blanguage-\S+\b/g);
			this.addClass(`language-${value}`);
		} else super._setOption(key, value);

		if (this.rendered && key === 'value' && this.options.validations?.length)
			retry(() => this.validate(), { delay: 500, max: 1 });
	}

	/**
	 * Checks if the input value has changed from its initial value
	 * @returns {boolean} True if value is no longer the initial value
	 */
	get isDirty() {
		return this.initialValue !== this.options.value;
	}

	/**
	 * Validates the input value against configured validation rules
	 * @param {object} options - Validation options
	 * @param {Array} options.validations - Custom validation rules to use
	 * @param {*} options.value - Custom value
	 * @returns {Array|undefined} Array of validation errors, or undefined if valid
	 */
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
