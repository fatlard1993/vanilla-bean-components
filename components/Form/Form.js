import { fromCamelCase, capitalize } from '../../utils';
import { DomElem } from '../DomElem';
import { Input } from '../Input';
import { Label } from '../Label';

export default class Form extends DomElem {
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
					Component = Input,
					onChange = () => {},
					parse = value => value,
					...inputOptions
				}) => {
					const input = new Component({
						appendTo: this.elem,
						value: this.options.data[key],
						...(Component !== DomElem && {
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
