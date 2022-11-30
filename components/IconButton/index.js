import Button from '../Button';

export class IconButton extends Button {
	constructor({ styles = () => '', ...options }) {
		super({
			styles: theme => `
				width: 30px;
				height: 30px;
				padding: 3px 0 8px 0;

				&:before {
					padding: 0;
				}

				${styles(theme)}
			`,
			...options,
		});
	}
}

export default IconButton;
