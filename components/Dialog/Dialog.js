import { styled } from '../../utils';
import { DomElem } from '../DomElem';
import { Button } from '../Button';

const DialogHeader = styled(
	DomElem,
	() => `
		width: 50%;
		text-align: center;
		font-size: 1.2em;
		line-height: 30px;
		margin: 0;
	`,
);

const DialogContent = styled(
	DomElem,
	({ colors }) => `
		flex: 1;
		padding: 6px 6px 6px 21px;
		overflow: hidden auto;

		&::before {
			content: "";
			display: block;
			position: absolute;
			background: repeating-linear-gradient(43deg, transparent, transparent 7px, ${colors.lightest(
				colors.teal,
			)} 7px, ${colors.lightest(colors.teal)} 14px );
			width: 9px;
			height: 56px;
			bottom: 64px;
			left: 9px;
			opacity: 0.8;
		}
	`,
);

const DialogFooter = styled(
	DomElem,
	({ colors }) => `
		height: 40px;
		border-top: 2px solid ${colors.lighter(colors.teal)};
		display: flex;
		flex-direction: row;
		margin-right: -4px;
	`,
);

const DialogButton = styled(
	Button,
	() => `
		margin: 9px 18px 3px 30px;
		flex: 1;
	`,
);

const size_enum = Object.freeze(['small', 'standard', 'large']);
const defaultOptions = { tag: 'dialog', openOnRender: 16, modal: true, appendTo: document.body };

class Dialog extends DomElem {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };
	size_enum = size_enum;

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
			},
			...children,
		);

		// eslint-disable-next-line spellcheck/spell-checker
		this.elem.setAttribute('data-augmented-ui', 'tl-clip tr-2-clip-x br-clip bl-2-clip-y border');

		this.options['aria-labelledby'] = this.classId;

		this.elem.addEventListener('close', this.elem.remove);
	}

	render() {
		if (!this._header) {
			this._header = new DialogHeader({
				tag: 'h2',
				id: this.classId,
				append: this.options.header,
				appendTo: this,
			});
		}

		if (!this._body) {
			this._body = new DialogContent({ content: this.options.body, appendTo: this });
		}

		if (!this._footer) {
			this._footer = new DialogFooter({
				append:
					this.options.footer ||
					(this.options.buttons || []).map(
						button =>
							new DialogButton({
								onPointerPress: event =>
									this.options.onButtonPress({
										event,
										button,
										closeDialog: this.options.closeDialog || (() => this.close()),
									}),
								...(typeof button === 'object' ? button : { textContent: button }),
							}),
					),
				appendTo: this,
			});
		}

		super.render();

		if (this.options.openOnRender) {
			setTimeout(
				() => this.open(),
				typeof this.options.openOnRender === 'number' ? this.options.openOnRender : defaultOptions.openOnRender,
			);
		}
	}

	setOption(key, value) {
		if (key === 'openOnRender' || key === 'modal') return;

		if (key === 'size') {
			if (!size_enum.includes(value)) {
				throw new Error(
					`"${value}" is not a valid size. The size must be one of the following values: ${size_enum.join(', ')}`,
				);
			}

			this.removeClass(...size_enum);
			this.addClass(value);
		} else if (key === 'body') {
			this._body.options.content = value;
		} else super.setOption(key, value);
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
