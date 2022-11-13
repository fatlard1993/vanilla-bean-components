import './index.css';

import DomElem from '../DomElem';

export class Button extends DomElem {
	constructor({ icon, className, ...options }) {
		super({ tag: 'button', className: [...(icon ? [`fa-${icon}`] : []), className], ...options });
	}
}

export default Button;
