import { Input } from '../Input';

const defaultOptions = { type: 'number' };

class NumberInput extends Input {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}) {
		super({
			...defaultOptions,
			...options,
		});
	}
}

export default NumberInput;
