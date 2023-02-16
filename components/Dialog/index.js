import { customAlphabet } from 'nanoid';
import DomElem from '../DomElem';
import Button from '../Button';

const id = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 16);

export class Dialog extends DomElem {
	constructor({
		className,
		styles = () => '',
		header,
		content,
		footer,
		buttons = [],
		onButtonPress = () => {},
		closeDialog,
		size = 'small',
		...options
	}) {
		const headerId = id();

		super({
			attr: {
				role: 'dialog',
				'aria-labelledby': headerId,
			},
			styles: ({ colors, ...theme }) => `
				background-color: ${colors.darker(colors.grey)};
				border-radius: 3px;
				display: flex;
				flex-direction: column;
				border: 2px solid ${colors.dark(colors.blue)};

				/* Default size: small */
				width: 420px;
				height: 210px;

				&.standard {
					width: 840px;
					height: 420px;
				}

				&.large {
					width: 90vw;
					height: 90vh;
				}

				div.footer {
					height: 40px;
					border-top: 1px solid ${colors.dark(colors.grey)};
					display: flex;
					flex-direction: row;

					.DomElem.Button {
						margin: 6px;
						flex: 1;
					}
				}

				${styles({ colors, ...theme })}
			`,
			className: [className, size],
			appendChildren: [
				new DomElem({
					tag: 'h2',
					id: headerId,
					styles: theme => `
						text-align: center;
						font-size: 1.2em;
						line-height: 30px;
						border-bottom: 1px solid ${theme.greyDark};
					`,
					[typeof header === 'string' ? 'textContent' : 'appendChildren']: header,
				}),
				new DomElem({
					styles: () => `
						flex: 1;
						padding: 6px;
						overflow: auto;
					`,
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
									onPointerPress: () => onButtonPress({ button, closeDialog: closeDialog || (() => super.cleanup()) }),
								}),
						),
				}),
			],
			closeDialog: closeDialog || (() => super.cleanup()),
			...options,
		});
	}
}

export default Dialog;
