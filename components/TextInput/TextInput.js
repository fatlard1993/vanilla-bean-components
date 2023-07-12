import { Input } from '../Input';

const defaultOptions = { type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off' };

class TextInput extends Input {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}) {
		super({
			...defaultOptions,
			...options,
		});
	}
}

export default TextInput;
