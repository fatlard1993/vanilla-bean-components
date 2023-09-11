import { Input } from '../Input';

const defaultOptions = { tag: 'textarea' };

class Textarea extends Input {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
			},
			...children,
		);
	}
}

export default Textarea;
