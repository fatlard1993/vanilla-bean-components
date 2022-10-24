import './index.css';

import Modal from '../Modal';
import Dialog from '../Dialog';

export class ModalDialog {
	constructor({ appendTo, header, content, footer, buttons, ...options }) {
		this.modal = new Modal({ appendTo });
		this.dialog = new Dialog({
			appendTo: this.modal,
			header,
			content,
			footer,
			buttons,
			closeDialog: () => this.modal.cleanup(),
			...options,
		});

		this.elem = this.modal;
	}
}

export default ModalDialog;
