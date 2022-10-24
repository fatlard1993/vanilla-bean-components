import './index.css';

import Button from '../Button';

export class IconButton extends Button {
	constructor({ icon, className, ...options }) {
		super({ className: [icon ? `fa-${icon}` : undefined, className], ...options });
	}
}

export default IconButton;
