import { Elem } from '../../Elem';
import { styled } from '../../styled';
import { Menu } from '../Menu';
import { Popover } from '../Popover';

// Between the menu and the button it hangs from, and between the menu and the viewport's edge
const ANCHOR_GAP = 4;
const VIEWPORT_EDGE = 8;

const StyledPopover = styled(
	Popover,
	({ colors }) => `
		padding: 0;
		overflow: hidden auto;

		& li {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		& li .label, & li .detail {
			display: block;
		}

		& li .detail {
			margin-top: 2px;
			color: ${colors.light(colors.gray)};
			font-size: 0.8em;
			white-space: normal;
		}

		& li.heading, & li.heading:hover {
			padding: 10px 6px 2px;
			border-bottom: none;
			cursor: default;
			color: ${colors.light(colors.gray)} !important;
			font-size: 0.75em;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
	`,
);

// A heading names the group under it; an item with a detail shows it as a second, smaller line
const menuItem = (item, choose) => {
	if (item.heading !== undefined) return { textContent: item.heading, role: 'presentation', addClass: 'heading' };

	const { detail, textContent, onPointerPress, ...rest } = item;

	return {
		...rest,
		...(detail === undefined
			? { textContent }
			: {
					append: [
						new Elem({ tag: 'span', addClass: 'label', textContent }),
						new Elem({ tag: 'span', addClass: 'detail', textContent: detail }),
					],
				}),
		onPointerPress: event => choose(onPointerPress, event),
	};
};

/**
 * A menu that opens at a point (a right-click, a long press) or under the button that asked for it.
 *
 * Choosing an item runs its onPointerPress and closes the menu, unless sticky. Escape and a press outside close it too,
 * and so does showing it again from the same button, so a button toggles its menu. It is placed by its own measured
 * size, so it flips away from the edges it would cross, and focus moves into it on opening and back on closing.
 * @param {object} [options] - ContextMenu configuration
 * @param {Array<object>} [options.items] - Menu items, e.g. { textContent, detail, onPointerPress }, and headings, { heading }
 * @param {boolean} [options.sticky] - Stay open after an item is chosen
 * @param {number} [options.maxWidth] - Widest the menu may be
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {ContextMenu} ContextMenu component instance
 * @example
 * const menu = new ContextMenu({ items: [{ textContent: 'Rename', onPointerPress: rename }] });
 * card.on({ targetEvent: 'contextmenu', callback: event => { event.preventDefault(); menu.show({ x: event.clientX, y: event.clientY }); } });
 * moreButton.onPointerPress(() => menu.show({ anchor: moreButton }));
 */
class ContextMenu extends StyledPopover {
	static schema = {
		autoOpen: { default: false },
		outsideClose: { default: true },
		maxWidth: { default: 240 },
		sticky: { default: false },
		items: {
			set(value) {
				if (!this.menu) this.menu = new Menu({ appendTo: this });

				this.menu.options.items = (value ?? []).map(item =>
					menuItem(item, (onPointerPress, event) => {
						onPointerPress?.(event);

						if (!this.options.sticky) this.hide();
					}),
				);
			},
		},
	};

	build() {
		super.build();

		this._onKeydown = event => {
			if (event.key === 'Escape' && this.shown) {
				event.preventDefault();
				this.hide();
			}
		};

		this.addCleanup('contextMenuKeys', () => document.removeEventListener('keydown', this._onKeydown));
	}

	/**
	 * Opens the menu at a point, or under an element; showing it again from the same element closes it.
	 * @param {object} [options] - Where to open
	 * @param {number} [options.x] - The point's x, in viewport pixels
	 * @param {number} [options.y] - The point's y, in viewport pixels
	 * @param {HTMLElement|Elem} [options.anchor] - The element to hang under, or over when there's more room above
	 */
	show({ x, y, anchor } = {}) {
		if (!this.elem.isConnected) return;

		const anchorElem = anchor?.elem ?? anchor;

		if (anchorElem && this.shown && this._anchor === anchorElem) {
			this.hide();
			return;
		}

		this._setAnchor(anchorElem);
		this._opener = document.activeElement;

		// Measured from a clean slate, so a menu whose items changed isn't held to its last size
		this.elem.style.maxWidth = `${this.options.maxWidth}px`;
		this.elem.style.maxHeight = '';

		super.show();
		this.shown = true;

		// Placed by what it measures now it is open, rather than by a guess at its rows
		if (anchorElem) this._placeUnder(anchorElem);
		else if (x !== undefined && y !== undefined) {
			this.edgeAwarePlacement({
				x,
				y,
				maxWidth: Math.min(this.elem.offsetWidth || this.options.maxWidth, this.options.maxWidth),
				maxHeight: Math.min(this.elem.offsetHeight, window.innerHeight - 48),
			});
		}

		document.addEventListener('keydown', this._onKeydown);
		this.menu?.elem.querySelector('li:not([role="presentation"])')?.focus();
	}

	/**
	 * Closes the menu and hands focus back to where it was.
	 */
	hide() {
		const wasOpen = this.shown;

		this.shown = false;
		this._setAnchor(null);
		document.removeEventListener('keydown', this._onKeydown);
		super.hide();

		if (wasOpen && this._opener?.isConnected) this._opener.focus();
		this._opener = null;
	}

	_setAnchor(anchor) {
		this._anchor?.setAttribute('aria-expanded', 'false');
		this._anchor = anchor ?? null;

		if (!anchor) return;

		anchor.setAttribute('aria-haspopup', 'menu');
		anchor.setAttribute('aria-expanded', 'true');
	}

	// Under the element, or over it when there's more room above; its left edge lined up, moved in from the viewport's
	_placeUnder(anchor) {
		const at = anchor.getBoundingClientRect();
		const viewportWidth = document.documentElement.clientWidth;
		const viewportHeight = window.innerHeight;
		const width = Math.min(this.elem.offsetWidth || this.options.maxWidth, this.options.maxWidth);
		const below = viewportHeight - at.bottom - ANCHOR_GAP - VIEWPORT_EDGE;
		const above = at.top - ANCHOR_GAP - VIEWPORT_EDGE;
		const downward = this.elem.offsetHeight <= below || below >= above;
		const height = Math.min(this.elem.offsetHeight, downward ? below : above);

		Object.assign(this.elem.style, {
			maxHeight: `${Math.max(downward ? below : above, 0)}px`,
			left: `${Math.max(VIEWPORT_EDGE, Math.min(at.left, viewportWidth - width - VIEWPORT_EDGE))}px`,
			top: `${downward ? at.bottom + ANCHOR_GAP : at.top - ANCHOR_GAP - height}px`,
			right: 'unset',
			bottom: 'unset',
		});
	}
}

export default ContextMenu;
