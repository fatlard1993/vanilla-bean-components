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
					...(Component === Input ? { type: typeof options.data[key] === 'number' ? 'number' : 'string' } : {}),
					...inputOptions,
				});

				this.append(new Label(label || capitalize(key), input));

				return [key, input];
			}),
		);
	}

	validate(options) {
		const validationErrors = this.options.inputs
			.map(({ key }) => this.inputElements[key].validate?.(options))
			.filter(errors => !!errors);

		return validationErrors.length > 0;
	}
}
