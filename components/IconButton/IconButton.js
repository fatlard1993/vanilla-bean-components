import { Button } from '../Button';

class IconButton extends Button {
	constructor(options = {}) {
		super({
			...options,
			styles: theme => `
				width: 30px;
				height: 30px;
				padding: 3px 0 8px 0;

				&:before {
					padding: 0;
				}

				${options.styles?.(theme) || ''}
			`,
		});
	}
}

export default IconButton;
