import './index.css';

import DomElem from '../DomElem';

export class Modal extends DomElem {
	constructor({ className, ...rest }) {
		super('div', { className: ['modal', className], ...rest });
	}
}

export default Modal;
