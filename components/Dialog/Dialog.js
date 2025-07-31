/* eslint-disable spellcheck/spell-checker */
import { styled } from '../../styled';
import { Button } from '../Button';
import { Component } from '../../Component';
import { Elem } from '../../Elem';

const DialogButton = styled(
	Button,
	() => `
		margin: 9px 18px 3px 30px;
		flex: 1;
	`,
);

const size_enum = Object.freeze(['small', 'standard', 'large']);
const variant_enum = Object.freeze(['info', 'success', 'warning', 'error']);

const defaultOptions = {
	tag: 'dialog',
	size: 'small',
	openOnRender: 16,
	modal: true,
	appendTo: document.body,
	registeredEvents: new Set(['close']),

	augmentedUI: 'tl-clip tr-2-clip-x br-clip bl-2-clip-y border',
};

class Dialog extends styled(
	Component,
	({ colors }) => `
		background-color: transparent;
		color: ${colors.white};
		flex-direction: column;
		padding: 6px;
		margin: 0 auto;
		border: none;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
		transition: display 0.6s allow-discrete, overlay 0.6s allow-discrete;
		animation: fadeOut 0.6s ease-out forwards;

		--aug-border-bg: linear-gradient(-12deg, ${colors.light(colors.teal)}, ${colors.light(colors.blue)});
		--aug-border-all: 2px;
		--aug-tl1: 30px;
		--aug-tr-extend1: 30%;
		--aug-tr1: 30px;
		--aug-bl-extend2: 32px;
		--aug-br1: 12px;

		&[open] {
			display: flex;
			animation: fadeIn 0.6s ease-out forwards;
		}

		.header {
			width: 60%;
			text-align: center;
			font-size: 1.2em;
			margin: 0;
		}

		.content {
			flex: 1;
			padding: 6px 21px;
			overflow: hidden auto;

			&::-webkit-scrollbar-track {
				margin: 24px 0 3px 0;
			}

			&:before {
				content: "";
				display: block;
				position: absolute;
				background: repeating-linear-gradient(43deg, transparent, transparent 7px, ${colors.lightest(colors.teal)} 7px, ${colors.lightest(colors.teal)} 14px );
				width: 9px;
				height: 56px;
				bottom: 64px;
				left: 9px;
				opacity: 0.8;
			}
		}

		.footer {
			height: 40px;
			border-top: 2px solid ${colors.lighter(colors.teal)};
			display: flex;
			flex-direction: row;
			margin-right: -4px;
		}

		&.size-small {
			width: 420px;
			height: 210px;
		}

		&.size-standard {
			width: 840px;
			height: 420px;
		}

		&.size-large {
			width: 90vw;
			height: 90vh;
		}

		&::backdrop {
			background-color: ${colors.black.setAlpha(0.9)};
			backdrop-filter: blur(3px);
		}

		&.variant-info {
			--aug-border-bg: linear-gradient(-12deg, ${colors.blue}, ${colors.light(colors.blue)});

			.header {
				color: ${colors.blue};
			}

			.content:before {
				background: repeating-linear-gradient(43deg, transparent, transparent 7px, ${colors.blue} 7px, ${colors.light(colors.blue)} 14px );
			}

			.footer {
				border-color: ${colors.blue};

				button {
					background-color: ${colors.blue};
				}
			}
		}

		&.variant-success {
			--aug-border-bg: linear-gradient(-12deg, ${colors.green}, ${colors.light(colors.green)});

			.header {
				color: ${colors.green};
			}

			.content:before {
				background: repeating-linear-gradient(43deg, transparent, transparent 7px, ${colors.green} 7px, ${colors.light(colors.green)} 14px );
			}

			.footer {
				border-color: ${colors.green};

				button {
					background-color: ${colors.green};
				}
			}
		}

		&.variant-warning {
			--aug-border-bg: linear-gradient(-12deg, ${colors.yellow}, ${colors.light(colors.yellow)});

			.header {
				color: ${colors.yellow};
			}

			.content:before {
				background: repeating-linear-gradient(43deg, transparent, transparent 7px, ${colors.light(colors.yellow)} 7px, ${colors.lighter(colors.yellow)} 14px );
			}

			.footer {
				border-color: ${colors.yellow};

				button {
					background-color: ${colors.yellow};
				}
			}
		}

		&.variant-error {
			--aug-border-bg: linear-gradient(-12deg, ${colors.red}, ${colors.light(colors.red)});

			.header {
				color: ${colors.red};
			}

			.content:before {
				background: repeating-linear-gradient(43deg, transparent, transparent 7px, ${colors.red} 7px, ${colors.light(colors.red)} 14px );
			}

			.footer {
				border-color: ${colors.red};

				button {
					background-color: ${colors.red};
				}
			}
		}

		@keyframes fadeIn {
			0% {
				opacity: 0;
				width: 150px;
				height: 120px;
			}
			30% {
				height: revert-layer;
			}
			50% {
				opacity: 1;
			}
			100% {
				opacity: 1;
				width: revert-layer;
				height: revert-layer;
			}
		}

		@keyframes fadeOut {
			0% {
				opacity: 1;
				width: revert-layer;
				height: revert-layer;
			}
			60% {
				opacity: 0.1;
			}
			100% {
				opacity: 0;
				width: 150px;
				height: 120px;
			}
		}
	`,
) {
	variant_enum = variant_enum;
	size_enum = size_enum;

	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, children);

		this.options['aria-labelledby'] = this.uniqueId;
	}

	render() {
		if (!this._header) {
			this._header = new Elem({
				tag: 'h2',
				id: this.uniqueId,
				addClass: ['header'],
				content: this.options.header,
				appendTo: this,
			});
		}

		if (!this._body) {
			this._body = new Elem({ content: this.options.body, addClass: ['content'], appendTo: this });
		}

		if (!this._footer) {
			this._footer = new Elem({
				addClass: ['footer'],
				append:
					this.options.footer ||
					this.options.buttons?.map(
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

	_setOption(key, value) {
		if (key === 'openOnRender' || key === 'modal') return;

		if (key === 'size') {
			if (value && !size_enum.includes(value)) {
				throw new Error(
					`"${value}" is not a valid size. The size must be one of the following values: ${size_enum.join(', ')}`,
				);
			}

			this.removeClass(/\bsize-\S+\b/g);

			if (value) this.addClass(`size-${value}`);
		} else if (key === 'variant') {
			if (value && !variant_enum.includes(value)) {
				throw new Error(
					`"${value}" is not a valid variant. The variant must be one of the following values: ${variant_enum.join(', ')}`,
				);
			}

			this.removeClass(/\bvariant-\S+\b/g);

			if (value) this.addClass(`variant-${value}`);
		} else if (key === 'body') {
			this._body.content(value);
		} else if (key === 'header') {
			this._header.content(value);
		} else super._setOption(key, value);
	}

	open(modal = this.options.modal) {
		try {
			this.elem[modal ? 'showModal' : 'show']();
		} catch (error) {
			// eslint-disable-next-line no-console
			if (process.env.NODE_ENV === 'development') console.error(error, 'Retrying...');

			this.render();
		}
	}

	close(returnValue) {
		this.elem.close(returnValue);
	}
}

export default Dialog;
