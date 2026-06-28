import { styled } from '../../styled';
import { Button } from '../Button';
import { Component } from '../../Component';
import { Elem } from '../../Elem';
import { isDev } from '../../utils';

const DialogButton = styled(
	Button,
	() => `
		margin: 4px 4px 4px 0;
	`,
);

const size_enum = Object.freeze(['small', 'standard', 'large']);
const variant_enum = Object.freeze(['info', 'success', 'warning', 'error']);

const defaultOptions = {
	tag: 'dialog',
	size: 'small',
	openOnRender: 16,
	modal: true,
	get appendTo() {
		return document.body;
	},
	registeredEvents: new Set(['close']),
};

/**
 * Modal and non-modal dialog component with customizable appearance and behavior.
 *
 * Provides native HTML dialog functionality with enhanced styling, animations, and configurable
 * header/body/footer sections. Supports different sizes, color variants, and button configurations.
 * @param {object} [options] - Dialog configuration options
 * @param {string} [options.tag] - HTML tag, uses native dialog element
 * @param {('small'|'standard'|'large')} [options.size] - Dialog size
 * @param {('info'|'success'|'warning'|'error')} [options.variant] - Color variant
 * @param {number|boolean} [options.openOnRender] - Auto-open delay in ms, or false to disable
 * @param {boolean} [options.modal] - Whether to open as modal dialog
 * @param {string} [options.header] - Header text content
 * @param {string|Component} [options.body] - Body content
 * @param {Array<Component>} [options.footer] - Custom footer components
 * @param {Array<string|object>} [options.buttons] - Button configurations for default footer
 * @param {Function} [options.onButtonPress] - Handler for button press events
 * @param {Function} [options.closeDialog] - Custom close function
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Dialog} Dialog component instance
 */
class Dialog extends styled(
	Component,
	({ colors }) => `
		background-color: ${colors.darker(colors.gray)};
		color: ${colors.white};
		flex-direction: column;
		padding: 0;
		margin: 0 auto;
		border: 1px solid ${colors.alpha(colors.light(colors.teal), 0.6)};
		box-shadow: 0 8px 40px ${colors.alpha(colors.vantablack, 0.7)};
		border-radius: 0;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
		transition: display 0.3s allow-discrete, overlay 0.3s allow-discrete;
		animation: dialogFadeOut 0.3s ease-out forwards;

		&[open] {
			display: flex;
			animation: dialogFadeIn 0.3s ease-out forwards;
		}

		& .header {
			padding: 8px 12px;
			font-size: 0.9em;
			font-weight: 600;
			color: ${colors.white};
			background-color: ${colors.alpha(colors.vantablack, 0.25)};
			border-bottom: 1px solid ${colors.alpha(colors.light(colors.teal), 0.2)};
			margin: 0;
		}

		& .content {
			flex: 1;
			padding: 12px;
			overflow: hidden auto;
		}

		& .footer {
			border-top: 1px solid ${colors.alpha(colors.white, 0.06)};
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-end;
			padding: 0 6px;
			min-height: 40px;
		}

		&.size-small {
			width: 420px;
			height: 210px;
		}

		&.size-standard {
			width: 640px;
			height: 360px;
		}

		&.size-large {
			width: 90vw;
			height: 90vh;
		}

		&::backdrop {
			background-color: ${colors.black.setAlpha(0.85)};
			backdrop-filter: blur(2px);
		}

		&.variant-info {
			border-color: ${colors.alpha(colors.blue, 0.6)};
			& .header { color: ${colors.lighter(colors.blue)}; border-color: ${colors.alpha(colors.blue, 0.2)}; }
			& .footer button { background-color: ${colors.blue}; }
		}

		&.variant-success {
			border-color: ${colors.alpha(colors.green, 0.6)};
			& .header { color: ${colors.lighter(colors.green)}; border-color: ${colors.alpha(colors.green, 0.2)}; }
			& .footer button { background-color: ${colors.green}; }
		}

		&.variant-warning {
			border-color: ${colors.alpha(colors.yellow, 0.6)};
			& .header { color: ${colors.lighter(colors.yellow)}; border-color: ${colors.alpha(colors.yellow, 0.2)}; }
			& .footer button { background-color: ${colors.yellow}; }
		}

		&.variant-error {
			border-color: ${colors.alpha(colors.red, 0.6)};
			box-shadow: 0 0 32px ${colors.alpha(colors.red, 0.14)}, 0 8px 40px ${colors.alpha(colors.vantablack, 0.7)};
			& .header { color: ${colors.lighter(colors.red)}; border-color: ${colors.alpha(colors.red, 0.2)}; }
			& .footer button { background-color: ${colors.red}; }
		}

		@keyframes dialogFadeIn {
			from { opacity: 0; }
			to { opacity: 1; }
		}

		@keyframes dialogFadeOut {
			from { opacity: 1; }
			to { opacity: 0; }
		}
	`,
) {
	variant_enum = variant_enum;
	size_enum = size_enum;

	static handlers = {
		openOnRender(value) {
			const delay = typeof value === 'number' ? value : defaultOptions.openOnRender;
			const openDelay = value ? setTimeout(() => this.open(), delay) : null;
			this.replaceCleanup('openOnRender', () => openDelay && clearTimeout(openDelay));
		},
		// Claim the key so standard routing doesn't try to call elem.showModal() or set elem.modal.
		// The value is read directly from this.options.modal in open().
		modal() {},
		size(value) {
			if (value && !size_enum.includes(value)) {
				throw new Error(
					`"${value}" is not a valid size. The size must be one of the following values: ${size_enum.join(', ')}`,
				);
			}

			this.removeClass(/\bsize-\S+\b/g);

			if (value) this.addClass(`size-${value}`);
		},
		variant(value) {
			if (value && !variant_enum.includes(value)) {
				throw new Error(
					`"${value}" is not a valid variant. The variant must be one of the following values: ${variant_enum.join(', ')}`,
				);
			}

			this.removeClass(/\bvariant-\S+\b/g);

			if (value) this.addClass(`variant-${value}`);
		},
		body(value) {
			this.body?.content(value);
		},
		header(value) {
			this._header?.content(value);
		},
	};

	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, ...children);

		this.options['aria-labelledby'] = this.uniqueId;
	}

	build() {
		this._header = new Elem({
			tag: 'div',
			id: this.uniqueId,
			addClass: ['header'],
			content: this.options.header,
			appendTo: this,
		});

		this._body = new Elem({ addClass: ['content'], appendTo: this });

		this._footer = new Elem({
			addClass: ['footer'],
			append:
				this.options.footer ||
				this.options.buttons?.map(
					button =>
						new DialogButton({
							onPointerPress: event =>
								this.options.onButtonPress?.({
									event,
									button,
									dialog: this,
									closeDialog: this.options.closeDialog || (() => this.close()),
								}),
							...(typeof button === 'object' ? button : { textContent: button }),
						}),
				),
			appendTo: this,
		});
	}

	/**
	 * Content container — primary injection point for subclass and consumer content.
	 * @returns {Component} The dialog body component
	 */
	get body() {
		return this._body;
	}

	/**
	 * Opens the dialog, either as modal or non-modal
	 * @param {boolean} modal - Whether to open as modal dialog (default: true)
	 */
	open(modal = this.options.modal) {
		this._opener = document.activeElement;
		try {
			this.elem[modal ? 'showModal' : 'show']();
			this._openRetried = false;
			const focusable = this.elem.querySelector(
				'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
			);
			(focusable ?? this.elem).focus();
		} catch (error) {
			if (this._openRetried) return;

			this._openRetried = true;

			// eslint-disable-next-line no-console
			if (isDev) console.error(error, 'Retrying...');

			this.render();
		}
	}

	/**
	 * Closes the dialog with optional return value
	 * @param {string} returnValue - Value to return when dialog closes
	 */
	close(returnValue) {
		this.elem.close(returnValue);
		this._opener?.focus();
		this._opener = null;
	}
}

export default Dialog;
