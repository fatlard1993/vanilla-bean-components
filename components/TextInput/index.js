import './index.css';

import Input from '../Input';

export class TextInput extends Input {
	constructor({ autocomplete = 'off', autocapitalize = 'off', autocorrect = 'off', ...options }) {
		super({
			type: 'text',
			autocomplete,
			autocapitalize,
			autocorrect,
			...options,
		});
	}
}

export default TextInput;
