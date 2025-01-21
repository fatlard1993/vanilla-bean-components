import { fromCamelCase, capitalize } from '../../utils';
import { Component } from '../../Component';
import { Input } from '../Input';
import { Label } from '../Label';

export default class Form extends Component {
	render() {
		this.options.style = { ...this.options.style, overflow: 'hidden auto' };

		super.render();

		const form = this;

		this.inputElements = Object.fromEntries(
			this.options.inputs.map(
				({
					key,
					label,
					collapsed,
					InputComponent = Input,
					onChange = () => {},
					parse = value => value,
					...inputOptions
				}) => {
					const input = new InputComponent({
						appendTo: this.elem,
						value: this.options.data[key],
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

					this.append(new Label({ label: label || capitalize(fromCamelCase(key), true), collapsed }, input));

					return [key, input];
				},
			),
		);
	}

	validate(options) {
		if (!this.inputElements) return;

		const validationErrors = Object.values(this.inputElements)
			.map(input => input?.validate?.(options))
			.filter(errors => !!errors);

		return validationErrors.length > 0;
	}
}
