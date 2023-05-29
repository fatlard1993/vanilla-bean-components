import Modal from '../Modal';
import Dialog from '../Dialog';

export class ModalDialog {
	constructor({ styles = () => '', appendTo, header, content, footer, buttons, ...options }) {
		this.modal = new Modal({ appendTo });
		this.dialog = new Dialog({
			styles: ({ colors, ...theme }) => `
				/* Default size: small */
				margin: 17% auto 0;

				&.standard {
					margin: 13% auto 0;
				}

				&.large {
					margin: 5vh auto 0;
				}

				${styles({ colors, ...theme })}
			`,
			appendTo: this.modal,
			header,
			content,
			footer,
			buttons,
			closeDialog: () => this.modal.remove(),
			...options,
		});

		this.elem = this.modal;
	}
}

export default ModalDialog;
