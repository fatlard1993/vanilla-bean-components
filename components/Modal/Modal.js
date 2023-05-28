import DomElem from '../DomElem';

export class Modal extends DomElem {
	constructor({ styles = () => '', ...options }) {
		super({
			styles: ({ colors, ...theme }) => `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-color: ${colors.blackish(colors.blue).setAlpha(0.9)};

				${styles({ colors, ...theme })}
			`,
			...options,
		});
	}
}

export default Modal;
