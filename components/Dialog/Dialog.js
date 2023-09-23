import { styled } from '../../utils';
import { DomElem } from '../DomElem';
import { Button } from '../Button';

const DialogHeader = styled(
	DomElem,
	({ colors }) => `
		text-align: center;
		font-size: 1.2em;
		line-height: 30px;
		margin: 0;
		border-bottom: 1px solid ${colors.dark(colors.gray)};
	`,
);

const DialogContent = styled(
	DomElem,
	() => `
		flex: 1;
		padding: 6px;
		overflow: auto;
	`,
);

const DialogFooter = styled(
	DomElem,
	({ colors }) => `
		height: 40px;
		border-top: 1px solid ${colors.dark(colors.gray)};
		display: flex;
		flex-direction: row;
	`,
);

const DialogButton = styled(
	Button,
	() => `
		margin: 6px;
		flex: 1;
	`,
);

const size_enum = Object.freeze(['small', 'standard', 'large']);
const defaultOptions = { tag: 'dialog', openOnRender: 16, modal: true, appendTo: document.body };

class Dialog extends DomElem {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				styles: (theme, domElem) => `
					display: none;
					background-color: ${theme.colors.darker(theme.colors.gray)};
					color: ${theme.colors.white};
					border-radius: 3px;
					flex-direction: column;
					padding: 6px;
					margin: 0 auto;
					border: 2px solid ${theme.colors.dark(theme.colors.blue)};
					top: 50%;
					transform: translateY(-50%);

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

					&::backdrop {
						background-color: ${theme.colors.blackish(theme.colors.blue).setAlpha(0.9)};
						backdrop-filter: blur(3px);
					}

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);

		this.setOption('aria-labelledby', this.classId);

		this.elem.addEventListener('close', this.elem.remove);
	}

	render(options = this.options) {
		if (!this._header) {
			this._header = new DialogHeader({
				tag: 'h2',
				id: this.classId,
				append: options.header,
				appendTo: this,
			});
		}

		if (!this._body) {
			this._body = new DialogContent({ content: options.body, appendTo: this });
		}

		if (!this._footer) {
			this._footer = new DialogFooter({
				append:
					options.footer ||
					(options.buttons || []).map(
						button =>
							new DialogButton({
								onPointerPress: () =>
									options.onButtonPress({ button, closeDialog: options.closeDialog || (() => this.close()) }),
								...(typeof button === 'object' ? button : { textContent: button }),
							}),
					),
				appendTo: this,
			});
		}

		super.render(options);

		if (this.options.openOnRender) {
			setTimeout(
				() => this.open(),
				typeof this.options.openOnRender === 'number' ? this.options.openOnRender : defaultOptions.openOnRender,
			);
		}
	}

	setOption(name, value) {
		if (name === 'openOnRender' || name === 'modal') return;

		if (name === 'size') {
			if (!size_enum.includes(value)) {
				throw new Error(
					`"${value}" is not a valid size. The size must be one of the following values: ${size_enum.join(', ')}`,
				);
			}

			this.removeClass(...size_enum);
			this.addClass(value);
		} else if (name === 'body') {
			this._body.setOption('content', value);
		} else super.setOption(name, value);
	}

	open(modal = this.options.modal) {
		this.elem.style.display = 'flex';

		try {
			this.elem[modal ? 'showModal' : 'show']();
		} catch (error) {
			// eslint-disable-next-line no-console
			if (process.env.NODE_ENV === 'development') console.error(error, 'Retrying...');

			this.render();
		}
	}

	close(returnValue) {
		this.elem.style.display = 'none';
		this.elem.close(returnValue);
	}
}

export default Dialog;
