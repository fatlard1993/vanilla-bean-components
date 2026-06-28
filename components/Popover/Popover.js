import { styled } from '../../styled';
import { Icon } from '../Icon';

const StyledIcon = styled(
	Icon,
	({ colors }) => `
		position: absolute;
		background-color: ${colors.darkest(colors.gray)};
		color: ${colors.white};
		padding: 12px;
		border: 1px solid ${colors.lightest(colors.gray)};
		border-radius: 3px;
		margin: 0;

		&:popover-open {
			display: flex;
		}
	`,
);

const defaultOptions = {
	uniqueId: true,
	state: 'manual',
	outsideClose: false,
	get viewport() {
		return document.documentElement;
	},
	get appendTo() {
		return document.body;
	},
};
const state_enum = Object.freeze(['auto', 'manual']);

/**
 * Popover component using native HTML popover API with edge-aware positioning.
 *
 * Provides positioned overlay content with automatic edge detection and placement adjustment.
 * Supports manual and automatic dismiss behavior with customizable positioning and sizing.
 * @param {object} [options={}] - Popover configuration options
 * @param {string} [options.state='manual'] - Popover state ('auto', 'manual')
 * @param {boolean} [options.autoOpen=true] - Whether to automatically open on render
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
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };
	state_enum = state_enum;

	constructor({ autoOpen = true, onConnected: userOnConnected, ...options } = {}, ...children) {
		super(
			{
				...defaultOptions,
				onConnected: () => {
					if (autoOpen) {
						const timeoutId = setTimeout(() => this.show(), 200);
						this.replaceCleanup('autoOpen', () => clearTimeout(timeoutId));
					}
					userOnConnected?.();
				},
				...options,
			},
			...children,
		);

		if (this.options.x !== undefined && this.options.y !== undefined) this.edgeAwarePlacement(this.options);
	}

	static handlers = {
		state(value) {
			this.elem.popover = value;
		},
	};

	edgeAwarePlacement({
		x,
		y,
		maxHeight = this.options.maxHeight ?? 132,
		maxWidth = this.options.maxWidth ?? 264,
		padding = 24,
		viewport = this.options.viewport || this.options.appendTo,
	}) {
		const { left, bottom, right } = (viewport?.elem ?? viewport).getBoundingClientRect();

		const cursorOffset = 12;

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
	 * Shows the popover with optional position update.
	 * @param {object} [options] - Position and sizing options
	 */
	show(options) {
		if (options) this.edgeAwarePlacement(options);

		if (!this.elem.isConnected) return;

		this.elem.showPopover();

		if (this.options.outsideClose) {
			// Cancel any pending registration from a previous show()
			if (this._outsideDismissRaf) cancelAnimationFrame(this._outsideDismissRaf);
			if (this._outsideDismissListener) {
				document.removeEventListener('pointerdown', this._outsideDismissListener, { capture: true });
			}

			const onOutsidePress = e => {
				if (!this.elem.contains(e.target)) this.hide();
			};

			this._outsideDismissListener = onOutsidePress;

			// Defer one frame so the current press that opened us isn't immediately caught
			this._outsideDismissRaf = requestAnimationFrame(() => {
				this._outsideDismissRaf = null;
				document.addEventListener('pointerdown', onOutsidePress, { capture: true });
			});
		}
	}

	/**
	 * Hides the popover.
	 */
	hide() {
		try {
			this.elem.hidePopover();
		} catch {
			// Popover not shown or not connected
		}

		if (this._outsideDismissRaf) {
			cancelAnimationFrame(this._outsideDismissRaf);
			this._outsideDismissRaf = null;
		}
		if (this._outsideDismissListener) {
			document.removeEventListener('pointerdown', this._outsideDismissListener, { capture: true });
			this._outsideDismissListener = null;
		}
	}

	/**
	 * Checks if the popover is currently open.
	 * @returns {boolean} True if popover is open
	 */
	get isOpen() {
		return this.elem.matches(':popover-open');
	}

	destroy() {
		this.hide();
		super.destroy?.();
	}
}
