import { Oxject } from '@vanilla-bean/oxject';
import { fromCamelCase, capitalize } from '../../utils';
import { Component } from '../../Component';
import { Elem } from '../../Elem';
import { Input } from '../Input';
import { Label } from '../Label';

/**
 * Dynamic form component with reactive data binding, validation, layout groups, and conditional fields.
 *
 * Generates form inputs with labels from a configuration array. Each entry in `inputs` is either
 * a field definition or a group definition.
 *
 * **Field definition:**
 * ```js
 * {
 * key: 'name',                          // required — data key
 * label: 'Full Name',                   // optional — defaults to formatted key
 * InputComponent: Select,               // optional — defaults to Input
 * onChange: event => {},                // optional — called after data update
 * parse: value => value.trim(),         // optional — transform before storing
 * condition: data => data.type === 'x', // optional — hide field when false
 * validate: value => value ? null : 'Required', // optional — field-level validator
 * // ...any other InputComponent options
 * }
 * ```
 *
 * **Group definition** — renders inputs side-by-side in a layout container:
 * ```js
 * {
 * type: 'group',
 * style: { display: 'grid', gridTemplateColumns: '1fr 120px', gap: '8px' },
 * inputs: [ ...field definitions... ],
 * }
 * ```
 *
 * Groups can be nested. Fields inside groups support `condition` as normal.
 * When all conditional fields in a group are hidden, the group container is also hidden.
 * Conditional and invalid fields are excluded from validation when hidden.
 *
 * Setting `form.options.inputs = newInputs` rebuilds the form preserving the data store.
 * @param {object} [options={}] - Form configuration options
 * @param {Array<object>} options.inputs - Field and group definitions
 * @param {object} [options.data={}] - Initial form data
 * @param {...(Component|HTMLElement|string)} children - Appended after generated inputs
 */
export default class Form extends Component {
	build() {
		if (!this.options.inputs?.length) return;

		this.setStyle({ overflow: 'hidden auto' });

		const currentData = this.options.data ? { ...this.options.data } : {};
		this.options.data?.destroy?.();
		this.options.data = new Oxject(currentData);
		this.replaceCleanup('formData', () => this.options.data?.destroy?.());

		this._resetState();
		this._processInputs(this.options.inputs, this);
		this._wireConditions();
		this._setupAnnouncer();
	}

	/**
	 * Rebuild the form when inputs change without recreating the data store.
	 * Existing data is preserved; new keys are added with their initial values.
	 */
	static handlers = {
		inputs(value) {
			if (!this.rendered || !value || !this.options.data) return;
			this.empty();
			this._resetState();
			this._processInputs(value, this);
			this._wireConditions();
			this._setupAnnouncer();
		},
	};

	/** @private */
	_resetState() {
		clearTimeout(this._announceTimeout);
		this._announceTimeout = null;
		this.inputElements = {};
		this._conditionals = [];
		this._conditionalGroups = [];
		this._fieldValidators = {};
	}

	/** @private */
	_wireConditions() {
		if (!this._conditionals.length) return;
		const evaluate = () => this._evaluateConditions();
		this.options.data.addEventListener('set', evaluate);
		// replaceCleanup — safe to call multiple times (inputs handler re-wires on rebuild)
		this.replaceCleanup('conditions', () => this.options.data.removeEventListener('set', evaluate));
	}

	/**
	 * Recursively processes an input definition array into the given append target.
	 * Handles both field definitions and group definitions.
	 * @param {Array<object>} inputs - Field or group definitions
	 * @param {Component|Elem} appendTarget - Where to append generated elements
	 * @private
	 */
	_processInputs(inputs, appendTarget) {
		const form = this;

		for (const inputDef of inputs) {
			if (inputDef.type === 'group') {
				const group = new Component({ appendTo: appendTarget, style: inputDef.style });
				const priorConditionalCount = this._conditionals.length;
				this._processInputs(inputDef.inputs, group);
				// Track groups that contain conditional fields for container-level hide/show
				if (this._conditionals.length > priorConditionalCount) {
					this._conditionalGroups.push(group);
				}
				continue;
			}

			const {
				key,
				label,
				InputComponent = Input,
				onChange = () => {},
				parse = value => value,
				condition,
				validate,
				...inputOptions
			} = inputDef;

			const input = new InputComponent({
				value: this.options.data.subscriber(key),
				...(InputComponent !== Component && {
					onChange: function (event) {
						form.options.data[key] = this.options.value = parse(event.value, input);
						this.validate?.();
						onChange(event);
					},
				}),
				...inputOptions,
			});

			form.options.data[key] = input.options.value;
			form.inputElements[key] = input;

			if (validate) form._fieldValidators[key] = validate;

			const isCheckbox = input.options.type === 'checkbox';
			const wrapper = new Label(
				typeof label === 'object'
					? label
					: { label: label || capitalize(fromCamelCase(key), true), ...(isCheckbox && { variant: 'inline' }) },
				input,
			);

			appendTarget.append(wrapper);

			if (condition) {
				wrapper.elem.style.display = condition(form.options.data) ? '' : 'none';
				form._conditionals.push({ key, wrapper, condition });
			}
		}
	}

	/** @private */
	_setupAnnouncer() {
		if (!this._conditionals.length) return;
		this._announcer = new Elem({
			'aria-live': 'polite',
			'aria-atomic': 'true',
			style: {
				position: 'absolute',
				width: '1px',
				height: '1px',
				padding: '0',
				margin: '-1px',
				overflow: 'hidden',
				clip: 'rect(0, 0, 0, 0)',
				whiteSpace: 'nowrap',
				border: '0',
			},
			appendTo: this,
		});
	}

	/**
	 * Re-evaluates all conditional field and group visibility against current form data.
	 * Called automatically when any form data key changes.
	 * @private
	 */
	_evaluateConditions() {
		const newlyVisible = [];

		for (const { wrapper, condition } of this._conditionals) {
			const wasHidden = wrapper.elem.style.display === 'none';
			const isVisible = condition(this.options.data);
			wrapper.elem.style.display = isVisible ? '' : 'none';
			if (wasHidden && isVisible) {
				const label = wrapper.elem.querySelector('label')?.textContent?.trim();
				if (label) newlyVisible.push(label);
			}
		}

		// Hide group containers when all their conditional children are hidden
		for (const group of this._conditionalGroups) {
			const children = Array.from(group.elem.children);
			const anyVisible = !children.length || children.some(el => el.style.display !== 'none');
			group.elem.style.display = anyVisible ? '' : 'none';
		}

		if (newlyVisible.length && this._announcer) {
			this._announcer.textContent = '';
			clearTimeout(this._announceTimeout);
			this._announceTimeout = setTimeout(() => {
				if (this._announcer) this._announcer.textContent = `${newlyVisible.join(', ')} now available`;
			}, 50);
		}
	}

	/**
	 * Validates all visible form inputs and returns whether errors were found.
	 * Runs both VBC Input validations and field-level `validate` functions from the definition.
	 * Hidden conditional fields are excluded.
	 * @param {object} [options] - Validation options passed to individual input validators
	 * @returns {boolean} True if validation errors exist, false if all visible inputs are valid
	 */
	hasErrors(options) {
		if (!this.inputElements) return false;

		const hiddenKeys = new Set(
			(this._conditionals || []).filter(({ wrapper }) => wrapper.elem.style.display === 'none').map(({ key }) => key),
		);

		let hasErrors = false;

		for (const [key, input] of Object.entries(this.inputElements)) {
			if (hiddenKeys.has(key)) continue;

			if (input?.validate?.(options)) hasErrors = true;

			const fieldValidator = this._fieldValidators?.[key];
			if (fieldValidator) {
				const error = fieldValidator(this.options.data[key]);
				if (error) {
					input?.addClass?.('validation-errors');
					input?.elem?.setAttribute('aria-invalid', 'true');
					hasErrors = true;
				} else {
					input?.removeClass?.('validation-errors');
					input?.elem?.removeAttribute('aria-invalid');
				}
			}
		}

		return hasErrors;
	}
}
