import { fromCamelCase, capitalize } from '../../utils';
import { Component } from '../../Component';
import { Context } from '../../Context';
import { Input } from '../Input';
import { Label } from '../Label';

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
						appendTo: this.elem,
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

	validate(options) {
		if (!this.inputElements) return;

		const validationErrors = Object.values(this.inputElements)
			.map(input => input?.validate?.(options))
			.filter(errors => !!errors);

		return validationErrors.length > 0;
	}
}
