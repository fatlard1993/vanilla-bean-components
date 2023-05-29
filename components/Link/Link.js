import Button from '../Button';

export class Link extends Button {
	constructor({ styles = () => '', tooltip = { icon: 'link' }, ...options }) {
		super({
			tag: 'a',
			tooltip,
			styles: theme => `
				&:hover {
					overflow: visible;

					div.fa-link {
						display: block;
					}
				}

				${styles(theme)}
			`,
			...options,
		});
	}
}

export default Link;
