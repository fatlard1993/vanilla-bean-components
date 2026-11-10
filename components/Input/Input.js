import { Component } from '../../Component';
import { pressable } from '../../Component/pressable';
import { fileAccepted, retry } from '../../utils';
import { insertTabCharacter, adjustIndentation } from './utils';
import { runValidators, showFieldError } from './fieldError';

const INPUT_TYPES = Object.freeze([
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
 * @param {Function} [options.onFiles] - For type 'file': (files, event) with the files picked, dropped or pasted that accept allows
 * @param {Component|HTMLElement} [options.dropZone] - For type 'file': an area that takes dropped and pasted files, and opens the picker when pressed
 * @param {boolean} [options.syntaxHighlighting] - Enable syntax highlighting for textarea
 * @param {string} [options.language] - Programming language for syntax highlighting
 * @param {Function|Array<Function>} [options.validate] - `value => message`: what's wrong with the value, or nothing
 *   when it's fine; or a list of them. Checked when the value changes (what's typed is checked once the change is made,
 *   and rechecked as it's typed only to clear what's shown) and by validate(), the message shown below the field
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Input} Input component instance
 */
export default class Input extends Component {
	static schema = {
		tag: { default: 'input' },
		type: { enum: INPUT_TYPES },
		// The text defaults prepareOptions gives an input or textarea, as attributes: a browser without the property
		// (autocorrect outside Safari and Chrome) still reads the attribute
		autocomplete: { attribute: true },
		autocapitalize: { attribute: true },
		autocorrect: { attribute: true },
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
					const update = () => {
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
					let timeout;
					const debounced = () => {
						clearTimeout(timeout);
						timeout = setTimeout(update, 16);
					};

					// The last auto height's listeners go first; the cleanup holds this one's own, not whatever is current
					this.replaceCleanup('autoHeight', () => {
						clearTimeout(timeout);
						this.elem.removeEventListener('input', debounced);
						this.elem.removeEventListener('focus', update);
						this.__updateAutoHeight = null;
					});

					this.__updateAutoHeight = update;
					update();

					this.elem.addEventListener('input', debounced);
					this.elem.addEventListener('focus', update);
					this.on({ targetEvent: 'connected', id: 'autoHeightConnected', callback: () => this.__updateAutoHeight?.() });
				} else {
					// A set height ends the auto height, listeners and all
					this.replaceCleanup('autoHeight', () => {});
					this.elem.style.fieldSizing = '';

					this.elem.style.height = typeof value === 'number' ? `${value + 1}em` : value;
				}
			},
		},
		value: {
			default: '',
			set(value) {
				if (this.options.type === 'checkbox') this.elem.checked = value;
				// What was just typed is already there; writing it back would move the caret
				else if (this.elem.value !== String(value ?? '')) this.elem.value = value;

				// Mid-typing, only a shown error is rechecked, so it clears as soon as it's fixed without a new one
				// appearing before the user is done; the change, when they are, checks it in full
				const midTyping = this._typing && !this.hasClass('validation-errors');

				if (this.rendered && this.options.validate && !midTyping) retry(() => this.validate(), { delay: 500, max: 1 });
			},
		},
		syntaxHighlighting: {
			set(value) {
				this[value ? 'addClass' : 'removeClass']('syntax-highlighting');

				// Tab indents in a highlighted textarea, and stops when the highlighting does
				this.replaceDestroyCleanup('syntaxTab', () => {});

				if (!value || this.tag !== 'textarea') return;

				const handleKeydown = function (event) {
					if (event.key == 'Tab') {
						event.preventDefault();

						this.selectionStart === this.selectionEnd && !event.shiftKey
							? insertTabCharacter(this)
							: adjustIndentation({ textarea: this, action: event.shiftKey ? 'remove' : 'add' });
					}
				};

				this.elem.addEventListener('keydown', handleKeydown);
				this.replaceDestroyCleanup('syntaxTab', () => this.elem.removeEventListener('keydown', handleKeydown));
			},
		},
		language: {
			set(value) {
				if (!this.options.syntaxHighlighting) return;
				this.removeClass(/\blanguage-\S+\b/g);
				this.addClass(`language-${value}`);
			},
		},
		// Called by the field itself, so not wired as a listener
		onFiles: { data: true },
		dropZone: {
			set(value) {
				this._wireDropZone(value?.elem ?? value);
			},
		},
		// Read by validate() and the value handler; data, as validate() is also the method that runs it
		validate: { data: true },
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
		if (this.typesText) {
			const typed = () => {
				this._typing = true;
				this.options.value = this._elemValue();
				this._typing = false;
			};
			// Typing has usually set the value already, so setting it again checks nothing: the change checks it here
			const committed = () => {
				this.options.value = this._elemValue();

				if (this.options.validate) this.validate();
			};

			this.elem.addEventListener('input', typed);
			this.elem.addEventListener('change', committed);
			this.replaceDestroyCleanup('valueSync', () => {
				this.elem.removeEventListener('input', typed);
				this.elem.removeEventListener('change', committed);
			});
		}

		if (this.options.type === 'file') {
			const picked = event => {
				// A field read the plain way (its own change listener, a form's FormData) keeps what was picked
				if (!this.options.onFiles) return;

				this._takeFiles(event.target.files, event);
				// Cleared once every change listener has had it, so picking the same file again is still a change
				setTimeout(() => (this.elem.value = ''));
			};

			this.elem.addEventListener('change', picked);
			this.replaceDestroyCleanup('filesPicked', () => this.elem.removeEventListener('change', picked));
		}
	}

	// A field the user types or ticks into, whose value is theirs to change: not a file picker, nor a select
	get typesText() {
		return this.tag === 'textarea' || (this.tag === 'input' && this.options.type !== 'file');
	}

	// The element's value as the option holds it: a checkbox's checked state, a number field's number
	_elemValue() {
		const { type, value, checked } = this.elem;

		if (type === 'checkbox') return checked;
		if ((type === 'number' || type === 'range') && value !== '') return Number(value);

		return value;
	}

	_takeFiles(files, event) {
		const accepted = [...(files ?? [])].filter(file => fileAccepted(file, this.options.accept ?? this.elem.accept));

		if (accepted.length) this.options.onFiles?.(accepted, event);

		return accepted.length > 0;
	}

	_wireDropZone(zone) {
		this.replaceDestroyCleanup('dropZone', () => {});

		if (!zone) return;

		const carriesFiles = event => [...(event.dataTransfer?.types ?? [])].includes('Files');
		const listeners = {
			dragover: event => {
				if (!carriesFiles(event)) return;
				event.preventDefault();
				zone.classList.add('drag-over');
			},
			dragleave: event => {
				if (!zone.contains(event.relatedTarget)) zone.classList.remove('drag-over');
			},
			drop: event => {
				zone.classList.remove('drag-over');
				if (!carriesFiles(event)) return;
				event.preventDefault();
				this._takeFiles(event.dataTransfer.files, event);
			},
			paste: event => {
				if (event.clipboardData?.files?.length && this._takeFiles(event.clipboardData.files, event)) {
					event.preventDefault();
				}
			},
			click: event => {
				if (event.target !== this.elem) this.elem.click();
			},
		};

		for (const [type, listener] of Object.entries(listeners)) zone.addEventListener(type, listener);

		// Reachable from the keyboard, where pasting works, and pressed by Enter or Space like a click
		const undoPressable = pressable(zone);

		this.replaceDestroyCleanup('dropZone', () => {
			for (const [type, listener] of Object.entries(listeners)) zone.removeEventListener(type, listener);
			undoPressable();
			zone.classList.remove('drag-over');
		});
	}

	/**
	 * Checks if the input value has changed from its initial value
	 * @returns {boolean} True if value is no longer the initial value
	 */
	get isDirty() {
		return this.initialValue !== this.options.value;
	}

	/**
	 * Checks the value against the `validate` option, showing what's wrong below the field (or clearing it), and marking
	 * the field invalid for assistive technology.
	 * @param {object} [options] - Options
	 * @param {*} [options.value] - A value to check instead of the field's own
	 * @returns {Array<string>|undefined} What's wrong, or undefined when nothing is
	 */
	validate({ value = this.options.value } = {}) {
		const errors = runValidators(this.options.validate, value);

		showFieldError({ owner: this, messages: errors });

		return errors.length ? errors : undefined;
	}
}
