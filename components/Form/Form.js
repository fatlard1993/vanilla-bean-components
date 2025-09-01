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
	render() {
		this.options.style = { ...this.options.style, overflow: 'hidden auto' };
		this.options.data = new Context(this.options.data);

		super.render();

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

		// Re-attach any appended children
		if (this.options.append) this._setOption('append', this.options.append);
	}

	/**
	 * Validates all form inputs and returns validation status.
	 * @param {object} [options] - Validation options passed to individual input validators
	 * @returns {boolean} True if validation errors exist, false if all inputs are valid
	 */
	validate(options) {
		if (!this.inputElements) return;

		const validationErrors = Object.values(this.inputElements)
			.map(input => input?.validate?.(options))
			.filter(errors => !!errors);

		return validationErrors.length > 0;
	}
}
