import './index.css';

import DomElem from '../DomElem';

export class TextInput extends DomElem {
	constructor({ className, value = '', autocomplete = 'off', autocapitalize = 'off', autocorrect = 'off', ...rest }) {
		const initialValue = value;

		super('input', {
			type: 'text',
			className: ['textInput', className],
			value,
			autocomplete,
			autocapitalize,
			autocorrect,
			...rest,
		});

		this.isDirty = () => initialValue !== this.value;
	}
}

export default TextInput;
