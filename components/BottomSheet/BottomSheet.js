import { styled } from '../../styled';
import { Component } from '../../Component';
import { Elem } from '../../Elem';
import { duration, elevation, radius } from '../../theme/tokens';
import { firstFocusable } from '../../utils';

const defaultOpenDelay = 16;

/**
 * Mobile-friendly bottom sheet on the native `<dialog>`: a modal panel that slides up from the bottom edge.
 *
 * Mounts to document.body by default. open() slides it up and moves focus into it; close(), Escape, a press on the
 * dimmed page, a drag down on its handle past the threshold, or navigating away close it, and focus goes back to
 * where it was. However it closes, it announces `close`.
 * @param {object} [options={}] - BottomSheet configuration options
 * @param {number|boolean} [options.autoOpen=false] - Open a moment after rendering; a number is that moment in
 *   milliseconds
 * @param {Function} [options.onClose] - Hears `close`, however the sheet closed
 * @param {...(Component|HTMLElement|string)} children - Appended to the sheet body
 */
class BottomSheet extends styled(
	Component,
	({ colors, safeArea }) => `
		position: fixed;
		inset: auto 0 0 0;
		box-sizing: border-box;
		width: 100%;
		max-width: none;
		margin: 0;
		flex-direction: column;
		background: ${colors.surface};
		color: inherit;
		border: 1px solid ${colors.edge};
		border-bottom: none;
		border-radius: ${radius.lg} ${radius.lg} 0 0;
		box-shadow: ${elevation.lg};
		max-height: 85vh;
		max-height: 85dvh;
		/* Its content clears the home indicator and the rounded corners */
		padding: 0 ${safeArea.right} ${safeArea.bottom} ${safeArea.left};
		overflow: hidden;
		transform: translateY(100%);
		transition:
			transform ${duration.base} ease,
			display ${duration.base} allow-discrete,
			overlay ${duration.base} allow-discrete;

		&[open] {
			display: flex;
			transform: translateY(0);
		}

		@starting-style {
			&[open] {
				transform: translateY(100%);
			}
		}

		&::backdrop {
			background-color: ${colors.alpha(colors.black, 0)};
			transition:
				background-color ${duration.base},
				display ${duration.base} allow-discrete,
				overlay ${duration.base} allow-discrete;
		}

		&[open]::backdrop {
			background-color: ${colors.overlay};
		}

		@starting-style {
			&[open]::backdrop {
				background-color: ${colors.alpha(colors.black, 0)};
			}
		}

		& .sheet-drag-zone {
			flex-shrink: 0;
			height: 32px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: grab;
			touch-action: none;
			user-select: none;

			&:active { cursor: grabbing; }

			& .sheet-handle {
				width: 40px;
				height: 4px;
				border-radius: ${radius.pill};
				background: ${colors.alpha(colors.white, 0.2)};
				pointer-events: none;
			}
		}

		& .sheet-body {
			flex: 1;
			overflow-y: auto;
			overscroll-behavior: contain;
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
		// Children, given or appended through the option, land in the body, where they scroll
		append: {
			set(value) {
				this._body.append(value);
			},
		},
		autoOpen: {
			default: false,
			set(value) {
				const delay = typeof value === 'number' ? value : defaultOpenDelay;
				const openDelay = value ? setTimeout(() => this.open(), delay) : null;
				this.replaceCleanup('autoOpen', () => openDelay && clearTimeout(openDelay));
			},
		},
	};

	static events = ['close'];

	build() {
		this._dragZone = new Elem({ tag: 'div', appendTo: this, addClass: 'sheet-drag-zone' });
		new Elem({ tag: 'div', appendTo: this._dragZone, addClass: 'sheet-handle' });

		this._body = new Component({ appendTo: this, addClass: 'sheet-body' });

		// Every way out (close(), Escape, the backdrop, a drag, navigating away) ends here
		this.on({ targetEvent: 'close', id: 'sheetClosed', callback: () => this._closed() });

		// A press on the dimmed page lands on the dialog itself, outside its box
		this.on({
			targetEvent: 'click',
			id: 'sheetBackdrop',
			callback: event => {
				if (event.target !== this.elem) return;

				const { left, right, top, bottom } = this.elem.getBoundingClientRect();
				const outside = event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom;

				if (outside) this.close();
			},
		});

		this._initDragToClose();
	}

	/**
	 * Content area for child components. Append children here for scrollable content.
	 * @returns {Component} The sheet body component
	 */
	get body() {
		return this._body;
	}

	/**
	 * Whether the sheet is open.
	 * @returns {boolean} True while it's open
	 */
	get isOpen() {
		return Boolean(this.elem.open);
	}

	/**
	 * Slides the sheet into view, moves focus into it, and closes it if the page navigates away.
	 */
	open() {
		if (this.isOpen || !this.elem.isConnected) return;

		this._opener = document.activeElement;
		this.elem.showModal();
		(firstFocusable(this._body.elem) ?? this.elem).focus();

		this._closeOnNavigate = () => this.close();
		window.addEventListener('hashchange', this._closeOnNavigate);
		window.addEventListener('popstate', this._closeOnNavigate);
		this.replaceDestroyCleanup('closeOnNavigate', () => this._stopNavigateClose());
	}

	/**
	 * Slides the sheet out. Announces `close` only if it was open: closing a closed sheet dismisses nothing.
	 */
	close() {
		if (this.isOpen) this.elem.close();
	}

	_closed() {
		this._stopNavigateClose();

		if (this._opener?.isConnected) this._opener.focus();
		this._opener = null;
	}

	_stopNavigateClose() {
		if (!this._closeOnNavigate) return;

		window.removeEventListener('hashchange', this._closeOnNavigate);
		window.removeEventListener('popstate', this._closeOnNavigate);
		this._closeOnNavigate = null;
	}

	// One pointer path for mouse, touch and pen: the handle follows it down, and past the threshold the sheet closes
	_initDragToClose() {
		const sheet = this.elem;
		const dragZone = this._dragZone.elem;
		let startY = null;

		const reset = () => {
			startY = null;
			sheet.style.transition = '';
			sheet.style.transform = '';
		};

		const onDown = event => {
			if (event.button > 0) return;

			startY = event.clientY;
			dragZone.setPointerCapture?.(event.pointerId);
		};

		const onMove = event => {
			if (startY === null) return;

			const dy = event.clientY - startY;

			if (dy <= 0) return;

			sheet.style.transition = 'none';
			sheet.style.transform = `translateY(${dy}px)`;
		};

		const onUp = event => {
			if (startY === null) return;

			const dy = event.clientY - startY;

			reset();
			if (dy > Math.min(100, sheet.offsetHeight * 0.25)) this.close();
		};

		const listeners = [
			['pointerdown', onDown],
			['pointermove', onMove],
			['pointerup', onUp],
			['pointercancel', reset],
		];

		for (const [type, listener] of listeners) dragZone.addEventListener(type, listener, { signal: this.signal });
	}
}

export default BottomSheet;
