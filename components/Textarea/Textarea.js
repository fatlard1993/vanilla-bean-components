import { Input } from '../Input';

const defaultOptions = { tag: 'textarea' };

class Textarea extends Input {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}) {
		super({
			...defaultOptions,
			...options,
		});
	}
}

export default Textarea;
