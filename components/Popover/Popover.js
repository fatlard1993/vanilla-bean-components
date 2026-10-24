import { styled } from '../../styled';
import { Icon } from '../Icon';
import { elevation, radius, space } from '../../theme/tokens';

const StyledIcon = styled(
	Icon,
	({ colors }) => `
		position: absolute;
		background-color: ${colors.surface};
		color: ${colors.white};
		padding: ${space.md};
		border: 1px solid ${colors.edge};
		border-radius: ${radius.md};
		box-shadow: ${elevation.sm};
		margin: 0;

		&:popover-open {
			display: flex;
		}
	`,
);

/**
 * Popover component using native HTML popover API with edge-aware positioning.
 *
 * Provides positioned overlay content with automatic edge detection and placement adjustment.
 * Supports manual and automatic dismiss behavior with customizable positioning and sizing.
 * @param {object} [options={}] - Popover configuration options
 * @param {string} [options.state='manual'] - Popover state ('auto', 'manual')
 * @param {boolean|number} [options.autoOpen=true] - Open a moment after it's added to the page; a number is that
 *   moment in milliseconds, false waits for open()
 * @param {Function} [options.onClose] - Hears `close`, however it closed: close(), a light dismiss, a press outside
 * @param {number} [options.x] - X position for the popover
 * @param {number} [options.y] - Y position for the popover
 * @param {number} [options.maxWidth=264] - Maximum width in pixels
 * @param {number} [options.maxHeight=132] - Maximum height in pixels
 * @param {HTMLElement} [options.viewport] - Viewport element for edge detection
 * @param {string} [options.icon] - Icon to display in the popover
 * @param {string|Component} [options.content] - Popover content
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Popover} Popover component instance
 */
export default class Popover extends StyledIcon {
	static schema = {
		uniqueId: { default: true },
		state: {
			default: 'manual',
			enum: ['auto', 'manual'],
			set(value) {
				this.elem.popover = value;
			},
		},
		autoOpen: { default: true },
		// Positioning and dismissal config read from this.options by open()/edgeAwarePlacement()
		outsideClose: { default: false },
		viewport: {
			get default() {
				return document.documentElement;
			},
		},
		appendTo: {
			get default() {
				return document.body;
			},
		},
		maxWidth: { default: 264 },
		maxHeight: { default: 132 },
		x: {
			set() {
				this._placeAtPoint();
			},
		},
		y: {
			set() {
				this._placeAtPoint();
			},
		},
	};

	static events = ['close'];

	build() {
		this.on({
			targetEvent: 'connected',
			id: 'popoverAutoOpen',
			callback: () => {
				const { autoOpen } = this.options;

				if (!autoOpen) return;
				const timeoutId = setTimeout(() => this.open(), typeof autoOpen === 'number' ? autoOpen : 200);
				this.replaceCleanup('autoOpen', () => clearTimeout(timeoutId));
			},
		});

		// Opened or closed by the platform (a popovertarget button, a light dismiss), it still knows, and still announces
		// closing
		const onToggle = event => {
			if (event.newState === 'open') this._open = true;
			else if (this._open) this._closed();
		};

		this.elem.addEventListener('toggle', onToggle);
		this.replaceDestroyCleanup('popoverToggle', () => this.elem.removeEventListener('toggle', onToggle));
	}

	_placeAtPoint() {
		if (this.options.x !== undefined && this.options.y !== undefined) this.edgeAwarePlacement(this.options);
	}

	edgeAwarePlacement({
		x,
		y,
		maxHeight = this.options.maxHeight,
		maxWidth = this.options.maxWidth,
		padding = 24,
		viewport = this.options.viewport || this.options.appendTo,
	}) {
		const { left, top, bottom, right } = (viewport?.elem ?? viewport).getBoundingClientRect();

		const cursorOffset = 12;

		// A point computed off the viewport (a world position, a stale anchor) still shows on it
		if (right > left && bottom > top) {
			x = Math.min(Math.max(x, left), right);
			y = Math.min(Math.max(y, top), bottom);
		}

		let pastRight = x + maxWidth + padding >= right;
		const pastLeft = x - maxWidth + padding <= left;
		const pastBottom = y + maxHeight + padding >= bottom;
		// const pastTop = y - maxHeight + padding <= top;

		if (pastLeft && pastRight) {
			x = padding;
			pastRight = false;
		}

		this.elem.style.maxWidth = `${maxWidth}px`;
		this.elem.style.maxHeight = `${maxHeight}px`;
		this.elem.style.top = pastBottom ? 'unset' : `${y + cursorOffset}px`;
		this.elem.style.bottom = pastBottom ? `${document.documentElement.clientHeight + cursorOffset - y}px` : 'unset';
		this.elem.style.left = pastRight ? 'unset' : `${x + cursorOffset}px`;
		this.elem.style.right = pastRight ? `${document.documentElement.clientWidth + cursorOffset - x}px` : 'unset';
	}

	/**
	 * Opens the popover, placed at a point when one is given.
	 * @param {object} [options] - Position and sizing: { x, y, maxWidth, maxHeight }
	 */
	open(options) {
		clearTimeout(this._outsideHide);

		if (options) this.edgeAwarePlacement(options);

		if (!this.elem.isConnected) return;

		this.elem.showPopover();
		this._open = true;

		if (this.options.outsideClose) {
			// Cancel any pending registration from a previous open()
			if (this._outsideDismissRaf) cancelAnimationFrame(this._outsideDismissRaf);
			if (this._outsideDismissListener) {
				document.removeEventListener('click', this._outsideDismissListener, { capture: true });
			}

			// Hides once the press has been handled, so a toggle that closes us, or a press that shows us somewhere new,
			// decides first
			const onOutsidePress = e => {
				if (!this.elem.contains(e.target)) this._outsideHide = setTimeout(() => this.close());
			};

			this._outsideDismissListener = onOutsidePress;

			// Defer one frame so the current press that opened us isn't immediately caught
			this._outsideDismissRaf = requestAnimationFrame(() => {
				this._outsideDismissRaf = null;
				document.addEventListener('click', onOutsidePress, { capture: true });
			});
		}
	}

	/**
	 * Closes the popover, announcing `close` if it was open.
	 */
	close() {
		clearTimeout(this._outsideHide);

		try {
			this.elem.hidePopover();
		} catch {
			// Popover not shown or not connected
		}

		if (this._open) this._closed();
	}

	_closed() {
		this._open = false;

		if (this._outsideDismissRaf) {
			cancelAnimationFrame(this._outsideDismissRaf);
			this._outsideDismissRaf = null;
		}
		if (this._outsideDismissListener) {
			document.removeEventListener('click', this._outsideDismissListener, { capture: true });
			this._outsideDismissListener = null;
		}

		this.emit('close');
	}

	/**
	 * Whether the popover is open.
	 * @returns {boolean} True while it's open
	 */
	get isOpen() {
		return Boolean(this._open);
	}

	destroy() {
		this.close();
		super.destroy?.();
	}
}
