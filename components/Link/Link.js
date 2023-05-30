import Button from '../Button';

export class Link extends Button {
	constructor({ tooltip = { icon: 'link' }, ...options }) {
		super({
			tag: 'a',
			tooltip,
			...options,
		});
	}
}

export default Link;
