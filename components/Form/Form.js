import { capitalize } from '../../utils';
import { DomElem } from '../DomElem';
import { Input } from '../Input';
import { Label } from '../Label';

export default class Form extends DomElem {
	async render(options = this.options) {
		super.render(options);

		const form = this;

		this.inputElements = Object.fromEntries(
			options.inputs.map(({ key, label, collapsed, Component = Input, onChange = () => {}, ...inputOptions }) => {
				const input = new Component({
					appendTo: this.elem,
					value: options.data[key],
					onChange,
					...(Component === Input && {
						onChange: function (event) {
							form.options.data[key] = event.value;
							this.validate?.();
							onChange(event);
						},
					}),
					...(Component === Input ? { type: typeof options.data[key] === 'number' ? 'number' : 'string' } : {}),
					...inputOptions,
				});

				this.append(new Label({ label: label || capitalize(key), collapsed }, input));

				return [key, input];
			}),
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
