import { styled } from '../../styled';
import { Menu } from '../Menu';
import { Popover } from '../Popover';

const StyledPopover = styled(
	Popover,
	() => `
		padding: 0;
		overflow: hidden auto;

		& li {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	`,
);

/**
 * A menu that opens at a point: a right-click, a long press, or the button that asked for it.
 *
 * Choosing an item runs its onPointerPress and closes the menu, unless sticky. Escape and a press outside close it too.
 * It is placed by its own measured size, so it flips away from the edges it would cross, and focus moves into it on
 * opening and back to where it was on closing.
 * @param {object} [options] - ContextMenu configuration
 * @param {Array<object>} [options.items] - Menu items, e.g. { textContent, onPointerPress }
 * @param {boolean} [options.sticky] - Stay open after an item is chosen
 * @param {number} [options.maxWidth] - Widest the menu may be
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {ContextMenu} ContextMenu component instance
 * @example
 * const menu = new ContextMenu({ items: [{ textContent: 'Rename', onPointerPress: rename }] });
 * card.on({ targetEvent: 'contextmenu', callback: event => { event.preventDefault(); menu.show({ x: event.clientX, y: event.clientY }); } });
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

				this.menu.options.items = (value ?? []).map(item => ({
					...item,
					onPointerPress: event => {
						item.onPointerPress?.(event);

						if (!this.options.sticky) this.hide();
					},
				}));
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
	 * Opens the menu, at a point when given one.
	 * @param {object} [options] - Where to open
	 * @param {number} [options.x] - The point's x, in viewport pixels
	 * @param {number} [options.y] - The point's y, in viewport pixels
	 */
	show({ x, y } = {}) {
		if (!this.elem.isConnected) return;

		this._opener = document.activeElement;

		// Measured from a clean slate, so a menu whose items changed isn't held to its last size
		this.elem.style.maxWidth = `${this.options.maxWidth}px`;
		this.elem.style.maxHeight = '';

		super.show();
		this.shown = true;

		// Placed by what it measures now it is open, rather than by a guess at its rows
		if (x !== undefined && y !== undefined) {
			this.edgeAwarePlacement({
				x,
				y,
				maxWidth: Math.min(this.elem.offsetWidth || this.options.maxWidth, this.options.maxWidth),
				maxHeight: Math.min(this.elem.offsetHeight, window.innerHeight - 48),
			});
		}

		document.addEventListener('keydown', this._onKeydown);
		this.menu?.elem.querySelector('li')?.focus();
	}

	/**
	 * Closes the menu and hands focus back to where it was.
	 */
	hide() {
		const wasOpen = this.shown;

		this.shown = false;
		document.removeEventListener('keydown', this._onKeydown);
		super.hide();

		if (wasOpen && this._opener?.isConnected) this._opener.focus();
		this._opener = null;
	}
}

export default ContextMenu;
