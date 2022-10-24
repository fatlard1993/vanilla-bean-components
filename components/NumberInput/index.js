import './index.css';

import Input from '../Input';

export class NumberInput extends Input {
	constructor({ value, ...options }) {
		super({ type: 'number', value, ...options });
	}
}

export default NumberInput;
