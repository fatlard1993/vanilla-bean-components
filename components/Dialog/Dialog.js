import { customAlphabet } from 'nanoid';

import { styled } from '../../utils/styled';

import DomElem from '../DomElem';
import Button from '../Button';

const id = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 16);

const DialogButton = styled(
	Button,
	() => `
		margin: 6px;
		flex: 1;
	`,
);

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
			role: 'dialog',
			'aria-labelledby': headerId,
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
				}

				${styles({ colors, ...theme })}
			`,
			className: [className, size],
			appendChildren: [
				new DomElem({
					tag: 'h2',
					id: headerId,
					styles: ({ colors }) => `
						text-align: center;
						font-size: 1.2em;
						line-height: 30px;
						margin: 0;
						border-bottom: 1px solid ${colors.dark(colors.grey)};
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
								new DialogButton({
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
