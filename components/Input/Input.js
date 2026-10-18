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
// Only meaningful on input/textarea elements - child classes rendering other tags (e.g. ColorPicker's div) must not receive them
const textInputDefaults = {
	autocomplete: 'off',
	autocapitalize: 'off',
	autocorrect: 'off',
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
 * @param {Array<string>} [options.suggestions] - Values the browser offers while typing, as a datalist
 * @param {boolean} [options.syntaxHighlighting] - Enable syntax highlighting for textarea
 * @param {string} [options.language] - Programming language for syntax highlighting
 * @param {Array<Function>} [options.validations] - Array of validation functions
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Input} Input component instance
 */
export default class Input extends Component {
	static schema = {
		tag: { default: 'input' },
		type: { enum: type_enum },
		// Values the browser offers while typing, through a datalist kept in step with the option
		suggestions: {
			set(value) {
				if (!value?.length) {
					this._suggestions?.remove();
					this._suggestions = null;
					this.elem.removeAttribute('list');
					return;
				}

				if (!this._suggestions) {
					this._suggestions = document.createElement('datalist');
					this._suggestions.id = `${this.uniqueId}-suggestions`;
					document.body.append(this._suggestions);
					this.addCleanup('suggestions', () => this._suggestions?.remove());
				}

				this._suggestions.replaceChildren(
					...value.map(suggestion => Object.assign(document.createElement('option'), { value: suggestion })),
				);
				this.elem.setAttribute('list', this._suggestions.id);
			},
		},
		height: {
			default: 'auto',
			set(value) {
				if (this.tag !== 'textarea') return;

				if (value === 'auto') {
					this.__updateAutoHeight = () => {
						const lines = (this.elem.value?.match(/\n/g) || '').length + 1;

						if (this.options.syntaxHighlighting) {
							this.elem.style.height = `calc(${lines * 1.19}em + 10px)`;
							return;
						}

						// A browser that sizes a field to its content counts wrapped lines too
						if (globalThis.CSS?.supports?.('field-sizing', 'content')) {
							this.elem.style.fieldSizing = 'content';
							this.elem.style.height = '';
							return;
						}

						// Elsewhere newlines set the floor, and the measured height adds the wrapped lines; a field not laid out
						// yet measures nothing, so connecting and focusing fit it again
						this.elem.style.height = `calc(${lines * 1.25}em + 16px)`;

						if (this.elem.scrollHeight > this.elem.clientHeight) {
							this.elem.style.height = `${this.elem.scrollHeight + this.elem.offsetHeight - this.elem.clientHeight}px`;
						}
					};

					this.__debouncedUpdateAutoHeight =
						this.__debouncedUpdateAutoHeight ||
						(() => {
							clearTimeout(this.__autoHeightTimeout);
							this.__autoHeightTimeout = setTimeout(this.__updateAutoHeight, 16);
						});

					this.__updateAutoHeight();

					this.elem.addEventListener('input', this.__debouncedUpdateAutoHeight);
					this.elem.addEventListener('focus', this.__updateAutoHeight);
					this.on({ targetEvent: 'connected', id: 'autoHeightConnected', callback: () => this.__updateAutoHeight?.() });

					this.replaceCleanup('autoHeight', () => {
						clearTimeout(this.__autoHeightTimeout);
						this.elem.removeEventListener?.('input', this.__debouncedUpdateAutoHeight);
						this.elem.removeEventListener?.('focus', this.__updateAutoHeight);
					});
				} else {
					this.elem.removeEventListener('input', this.__debouncedUpdateAutoHeight);
					this.elem.removeEventListener('focus', this.__updateAutoHeight);
					clearTimeout(this.__autoHeightTimeout);
					this.elem.style.fieldSizing = '';

					this.elem.style.height = typeof value === 'number' ? `${value + 1}em` : value;
				}
			},
		},
		value: {
			default: '',
			set(value) {
				if (this.options.type === 'checkbox') this.elem.checked = value;
				else this.elem.value = value;

				if (this.rendered && this.options.validations?.length) retry(() => this.validate(), { delay: 500, max: 1 });
			},
		},
		syntaxHighlighting: {
			set(value) {
				this[value ? 'addClass' : 'removeClass']('syntax-highlighting');
			},
		},
		language: {
			set(value) {
				if (!this.options.syntaxHighlighting) return;
				this.removeClass(/\blanguage-\S+\b/g);
				this.addClass(`language-${value}`);
			},
		},
		autocorrect: {
			set(value) {
				this.elem.autocorrect = value;
			},
		},
		// Read by validate() and the value handler
		validations: {
			get default() {
				return [];
			},
		},
	};

	static prepareOptions(options) {
		const rawValue = options.value?.__isDerived ? options.value.toJSON() : options.value;
		const tag = options.tag || 'input';

		return {
			...(tag === 'input' ? { type: dataTypeToInputType[typeof rawValue] || 'text' } : {}),
			...(tag === 'input' || tag === 'textarea' ? textInputDefaults : {}),
			...options,
			// The class the theme gives an Input's look to, whatever the page does for bare fields
			addClass: ['vbc-input', options.addClass],
		};
	}

	constructor(options = {}, ...children) {
		super(options, ...children);

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

		this[errors ? 'addClass' : 'removeClass']('validation-errors');
		if (errors) this.elem.setAttribute('aria-invalid', 'true');
		else this.elem.removeAttribute('aria-invalid');

		return errors;
	}
}
