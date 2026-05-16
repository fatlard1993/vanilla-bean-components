import { fromCamelCase, capitalize } from '../../utils';
import { Component } from '../../Component';
import { Context } from '../../Context';
import { Input } from '../Input';
import { Label } from '../Label';

/**
 * Dynamic form component with reactive data binding and validation.
 *
 * Generates form inputs with labels from configuration and maintains reactive state
 * through Context integration. Supports custom input components and validation.
 * @param {object} [options={}] - Form configuration options
 * @param {Array<object>} options.inputs - Array of input configuration objects
 * @param {string} options.inputs[].key - Data key for the input field
 * @param {string} [options.inputs[].label] - Label text, defaults to formatted key
 * @param {Component} [options.inputs[].InputComponent=Input] - Input component class to use
 * @param {Function} [options.inputs[].onChange] - Change handler for individual input
 * @param {Function} [options.inputs[].parse] - Value parser function
 * @param {object} [options.data={}] - Initial form data object
 * @param {...(Component|HTMLElement|string)} children - Child elements to append after inputs
 * @returns {Form} Form component instance
 */
export default class Form extends Component {
	build() {
		if (!this.options.inputs?.length) return;
		this.setStyle({ overflow: 'hidden auto' });
		const currentData = this.options.data ? { ...this.options.data } : {};
		this.options.data?.destroy?.();
		this.options.data = new Context(currentData);
		this.replaceCleanup('formData', () => this.options.data?.destroy?.());

		const form = this;

		this.inputElements = Object.fromEntries(
			this.options.inputs.map(
				({ key, label, InputComponent = Input, onChange = () => {}, parse = value => value, ...inputOptions }) => {
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

					this.append(
						new Label(
							typeof label === 'object' ? label : { label: label || capitalize(fromCamelCase(key), true) },
							input,
						),
					);

					return [key, input];
				},
			),
		);
	}

	/**
	 * Validates all form inputs and returns whether errors were found.
	 * @param {object} [options] - Validation options passed to individual input validators
	 * @returns {boolean} True if validation errors exist, false if all inputs are valid
	 */
	hasErrors(options) {
		if (!this.inputElements) return false;

		const validationErrors = Object.values(this.inputElements)
			.map(input => input?.validate?.(options))
			.filter(errors => !!errors);

		return validationErrors.length > 0;
	}

	/**
	 * @deprecated Use hasErrors() instead. validate() returns true when errors EXIST (inverted from typical validation APIs).
	 * @param {object} [options] - Validation options passed to individual input validators
	 * @returns {boolean} True if validation errors exist, false if all inputs are valid
	 */
	validate(options) {
		return this.hasErrors(options);
	}
}
