import './index.css';

import Input from '../Input';

export class Textarea extends Input {
	constructor({ value = '', ...options }) {
		super({ tag: 'textarea', value, ...options });
	}
}

export default Textarea;
