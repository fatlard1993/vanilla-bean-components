import { capitalize } from '../../utils';
import { DomElem } from '../DomElem';
import { Input } from '../Input';
import { Label } from '../Label';

export default class Form extends DomElem {
	async render(options = this.options) {
		super.render(options);

		this.inputElements = Object.fromEntries(
			options.inputs.map(({ key, label, Component = Input, ...inputOptions }) => {
				const input = new Component({
					appendTo: this.elem,
					value: options.data[key],
					onChange: ({ value }) => {
						this.options.data[key] = value;
						input.validate?.();
					},
					...(Component === Input ? { type: typeof options.data[key] === 'number' ? 'number' : 'string' } : {}),
					...inputOptions,
				});

				this.append(new Label(label || capitalize(key), input));

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
