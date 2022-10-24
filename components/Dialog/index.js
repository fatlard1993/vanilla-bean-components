import './index.css';

import DomElem from '../DomElem';
import Button from '../Button';

export class Dialog extends DomElem {
	constructor({
		className,
		header,
		content,
		footer,
		buttons = [],
		onDismiss = () => {},
		closeDialog,
		size,
		...options
	}) {
		super({
			className: [className, size],
			appendChildren: [
				new DomElem({
					className: 'header',
					[typeof header === 'string' ? 'textContent' : 'appendChildren']: header,
				}),
				new DomElem({
					className: 'content',
					[typeof content === 'string' ? 'textContent' : 'appendChildren']: content,
				}),
				new DomElem({
					className: 'footer',
					appendChildren:
						footer ||
						buttons.map(
							button =>
								new Button({
									textContent: button,
									onPointerPress: () => onDismiss({ button, closeDialog: closeDialog || (() => super.cleanup()) }),
								}),
						),
				}),
			],
			...options,
		});
	}
}

export default Dialog;
