import Button from '../Button';

export class Link extends Button {
	constructor(options) {
		super({ tag: 'a', ...options });
	}
}

export default Link;
