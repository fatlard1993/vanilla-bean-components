import { styled } from '../../styled';
import { duration, intents } from '../../theme/tokens';
import { Button } from '../Button';
import { Component, classEnum } from '../../Component';
import { Elem } from '../../Elem';
import { firstFocusable, isDev } from '../../utils';

const DialogButton = styled(
	Button,
	({ space }) => `
		margin: ${space.xs} ${space.xs} ${space.xs} 0;
	`,
);

const defaultOpenDelay = 16;

/**
 * Modal and non-modal dialog component with customizable appearance and behavior.
 *
 * Provides native HTML dialog functionality with enhanced styling, animations, and configurable
 * header/body/footer sections. Supports different sizes, an intent that colors it, and button configurations.
 * @param {object} [options] - Dialog configuration options
 * @param {string} [options.tag] - HTML tag, uses native dialog element
 * @param {('small'|'standard'|'large'|'fit')} [options.size] - Dialog size; 'fit' is as tall as its content
 * @param {('info'|'success'|'warning'|'danger')} [options.intent] - What the dialog is about, drawn in that status role
 * @param {number|boolean} [options.autoOpen] - Open a moment after rendering; a number is that moment in milliseconds,
 *   false waits for open()
 * @param {boolean} [options.modal] - Whether to open as modal dialog
 * @param {string} [options.header] - Header text content
 * @param {string|Component} [options.body] - Body content
 * @param {Array<Component>} [options.footer] - Custom footer components
 * @param {Array<string|object>} [options.buttons] - Button configurations for default footer
 * @param {Function} [options.onButtonPress] - Hears a press on any of `buttons`, with { button, event, dialog, closeDialog };
 *   a button's own onPointerPress runs first
 * @param {Function} [options.closeDialog] - Custom close function
 * @param {Function} [options.onClose] - Hears `close`, however it closed: close(), Escape, a button
 * @param {boolean} [options.removeOnClose] - Destroy the dialog once it has closed and faded out; false keeps it to open again
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Dialog} Dialog component instance
 */
class Dialog extends styled(
	Component,
	({ colors, elevation, fontSize, radius, safeArea, space }) => `
		background-color: ${colors.surface};
		color: ${colors.white};
		flex-direction: column;
		padding: 0;
		margin: 0 auto;
		border: 1px solid ${colors.edge};
		box-shadow: ${elevation.lg};
		border-radius: ${radius.md};
		overflow: hidden;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
		transition: display ${duration.base} allow-discrete, overlay ${duration.base} allow-discrete;
		animation: dialogFadeOut ${duration.base} ease-out forwards;

		&[open] {
			display: flex;
			animation: dialogFadeIn ${duration.base} ease-out forwards;
		}

		& .header {
			padding: ${space.sm} ${space.md};
			font-size: ${fontSize.sm};
			font-weight: 600;
			color: ${colors.white};
			background-color: ${colors.alpha(colors.vantablack, 0.25)};
			border-bottom: 1px solid ${colors.alpha(colors.light(colors.accent), 0.2)};
			margin: 0;
		}

		& .content {
			flex: 1;
			padding: ${space.md};
			overflow: hidden auto;
		}

		& .footer {
			border-top: 1px solid ${colors.border};
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-end;
			padding: 0 ${space.sm};
			min-height: 40px;
		}

		/* Whatever its size, it fits a phone's screen, clear of the notch and the home indicator */
		max-width: calc(100vw - 2 * ${space.md} - ${safeArea.left} - ${safeArea.right});
		max-height: calc(100dvh - 2 * ${space.md} - ${safeArea.top} - ${safeArea.bottom});

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

		/* As tall as its content: the top layer gives a dialog inset 0, so releasing bottom lets it hug what it holds */
		&.size-fit {
			width: min(640px, 95vw);
			height: auto;
			bottom: auto;
			max-height: min(90vh, calc(100dvh - 2 * ${space.md} - ${safeArea.top} - ${safeArea.bottom}));
		}

		&::backdrop {
			background-color: ${colors.overlay};
			backdrop-filter: blur(2px);
		}

		${intents
			.map(
				intent => `
		&.intent-${intent} {
			border-color: ${colors.alpha(colors[intent], 0.6)};
			& .header { color: ${colors.lighter(colors[intent])}; border-color: ${colors.alpha(colors[intent], 0.2)}; }
			& .footer button:not([data-action='cancel']) { background-color: ${colors[intent]}; color: ${colors.mostReadable(colors[intent], [colors.white, colors.black])}; }
		}`,
			)
			.join('\n')}

		&.intent-danger {
			box-shadow: 0 0 32px ${colors.alpha(colors.danger, 0.14)}, ${elevation.lg};
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
	static schema = {
		tag: { default: 'dialog' },
		appendTo: {
			get default() {
				return document.body;
			},
		},
		autoOpen: {
			default: true,
			set(value) {
				const delay = typeof value === 'number' ? value : defaultOpenDelay;
				const openDelay = value ? setTimeout(() => this.open(), delay) : null;
				this.replaceCleanup('autoOpen', () => openDelay && clearTimeout(openDelay));
			},
		},
		// Read directly from this.options.modal in open()
		modal: { default: true },
		size: classEnum('size', ['small', 'standard', 'large', 'fit'], { default: 'small' }),
		intent: classEnum('intent', intents),
		body: {
			set(value) {
				this.body?.content(value);
			},
		},
		header: {
			set(value) {
				this._header?.content(value);
			},
		},
		buttons: {
			set() {
				this._refreshFooter();
			},
		},
		footer: {
			set() {
				this._refreshFooter();
			},
		},
		// Read from this.options at button-press time
		closeDialog: {},
		onButtonPress: {},
		// Read directly from this.options.removeOnClose when the dialog closes
		removeOnClose: { default: true },
	};

	static events = ['close'];

	/**
	 * Ask a yes-or-no question. The confirming button comes second: the dialog focuses its first button, so a reflexive
	 * Enter keeps things as they are. Any other way out (Escape, the backdrop) is a no.
	 * @param {object} options - Dialog options, plus the two labels
	 * @param {string} options.confirmLabel - Label of the confirming button
	 * @param {string} [options.cancelLabel] - Label of the safe first button
	 * @returns {Promise<boolean>} Whether the confirming button was pressed
	 */
	static confirm({ confirmLabel, cancelLabel = 'Cancel', ...options }) {
		return new Promise(resolve => {
			new this({
				...options,
				buttons: [{ textContent: cancelLabel, 'data-action': 'cancel' }, confirmLabel],
				onButtonPress: ({ button, closeDialog }) => {
					resolve(button === confirmLabel);
					closeDialog();
				},
				onClose: () => resolve(false),
			});
		});
	}

	build() {
		this.on({
			targetEvent: 'close',
			id: 'removeOnClose',
			callback: async () => {
				if (!this.options.removeOnClose) return;

				await Promise.all((this.elem.getAnimations?.() ?? []).map(animation => animation.finished.catch(() => {})));

				// Opened again while it faded out
				if (!this.elem.open) this.destroy();
			},
		});

		this.options['aria-labelledby'] = this.uniqueId;

		this._header = new Elem({
			tag: 'div',
			id: this.uniqueId,
			addClass: ['header'],
			content: this.options.header,
			appendTo: this,
		});

		this._body = new Elem({ addClass: ['content'], appendTo: this });

		this._footer = new Elem({ addClass: ['footer'], append: this._footerContent(), appendTo: this });
	}

	_refreshFooter() {
		if (this.rendered) this._footer?.content(this._footerContent() || []);
	}

	_footerContent() {
		return (
			this.options.footer ||
			this.options.buttons?.map(button => {
				const { onPointerPress, ...buttonOptions } = typeof button === 'object' ? button : { textContent: button };

				// The button's own press first, then the dialog's, which hears every button by what was pressed
				return new DialogButton({
					...buttonOptions,
					onPointerPress: event => {
						onPointerPress?.(event);
						this.options.onButtonPress?.({
							event,
							button,
							dialog: this,
							closeDialog: this.options.closeDialog || (() => this.close()),
						});
					},
				});
			})
		);
	}

	/**
	 * Content container - primary injection point for subclass and consumer content.
	 * @returns {Component} The dialog body component
	 */
	get body() {
		return this._body;
	}

	/**
	 * Opens the dialog, either as modal or non-modal
	 * @param {object} [options] - How to open it
	 * @param {boolean} [options.modal] - Whether to open as modal dialog; defaults to the modal option
	 */
	open({ modal = this.options.modal } = {}) {
		this._opener = document.activeElement;
		try {
			this.elem[modal ? 'showModal' : 'show']();
			this._openRetried = false;
			(firstFocusable(this.elem) ?? this.elem).focus();
		} catch (error) {
			if (this._openRetried) return;

			this._openRetried = true;

			// eslint-disable-next-line no-console
			if (isDev) console.error(error, 'Retrying...');

			this.render();
		}
	}

	/**
	 * Whether the dialog is open.
	 * @returns {boolean} True while it's open
	 */
	get isOpen() {
		return Boolean(this.elem.open);
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
