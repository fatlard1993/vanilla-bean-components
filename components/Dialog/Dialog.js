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

const defaultOptions = { tag: 'dialog', open: false };

class Dialog extends DomElem {
	size_enum = Object.freeze(['small', 'standard', 'large']);
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor({ content, ...options }) {
		const _header = new DialogHeader({
			tag: 'h2',
			append: options.header,
		});
		const _content = new DialogContent({ content });
		const _footer = new DialogFooter({
			append:
				options.footer ||
				(options.buttons || []).map(
					button =>
						new DialogButton({
							onPointerPress: () =>
								options.onButtonPress({ button, closeDialog: options.closeDialog || (() => super.remove()) }),
							...(typeof button === 'object' ? button : { textContent: button }),
						}),
				),
		});

		_header.elem.id = _header.classId;

		super({
			...defaultOptions,
			...options,
			'aria-labelledby': _header.elem.id,
			styles: theme => `
				background-color: ${theme.colors.darker(theme.colors.gray)};
				color: ${theme.colors.white};
				border-radius: 3px;
				display: flex;
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
				}

				${options.styles?.(theme) || ''}
			`,
			append: [_header, _content, _footer],
		});

		this._header = _header;
		this._content = _content;
		this._footer = _footer;

		this.elem.addEventListener('close', this.elem.remove);
	}

	setOption(name, value) {
		if (name === 'size') {
			if (!this.size_enum.includes(value)) {
				throw new Error(
					`"${value}" is not a valid size. The size must be one of the following values: ${this.size_enum.join(', ')}`,
				);
			}

			this.removeClass(...this.size_enum);
			this.addClass(value);
		} else super.setOption(name, value);
	}

	open() {
		requestAnimationFrame(() => {
			this.elem.style.display = 'flex';
			this.elem.showModal();
		});
	}

	close() {
		this.elem.style.display = 'none';
		this.elem.close();
	}
}

export default Dialog;
