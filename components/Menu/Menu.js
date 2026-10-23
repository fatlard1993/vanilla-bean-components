import { styled } from '../../styled';
import { List } from '../List';
import { space } from '../../theme/tokens';

// A row marked presentational (a heading over a group) is not an item: not focused, not selected
const itemsOf = elem =>
	Array.from(elem.children).filter(el => el.tagName === 'LI' && el.getAttribute('role') !== 'presentation');

const StyledList = styled(
	List,
	({ colors, focusRing }) => `
		margin: 0;
		padding: 0;
		list-style: none;

		& li {
			cursor: pointer;
			padding: ${space.sm};
			border-bottom: 1px solid ${colors.border};

			&:last-of-type, &:last-of-type > a {
				border-bottom: none !important;
			}

			&:hover, & a:hover {
				background-color: ${colors.alpha(colors.white, 0.08)};
			}

			/* Inside the row: a menu in a popover clips what reaches past its edge */
			&:focus-visible, & a:focus-visible {
				${focusRing('-2px')}
			}
		}
	`,
);

/**
 * Menu component for displaying interactive navigation or selection lists.
 *
 * Extends List component with menu-specific styling including hover effects,
 * borders, and click handling. Provides consistent menu appearance and behavior.
 * @param {object} [options={}] - Menu configuration options
 * @param {Array<*>} [options.items] - Array of menu items to render
 * @param {Function} [options.onSelect] - Handler for the "select" CustomEvent fired when a menu item is activated; the activation event is in event.detail
 * @param {Component} [options.ListItemComponent] - Custom component class for rendering menu items
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Menu} Menu component instance
 */
export default class Menu extends StyledList {
	static schema = {
		role: { default: 'menu' },
		items: {
			set(value, next) {
				next(value);
				if (!value) return;
				itemsOf(this.elem).forEach((li, i) => li.setAttribute('tabindex', i === 0 ? '0' : '-1'));
			},
		},
	};

	static events = ['select'];

	build() {
		this.on({
			targetEvent: 'click',
			id: 'menuSelect',
			callback: event => {
				// Selecting requires an item, the same way the keyboard path below requires a focused
				// one. Emitting for any click on the menu meant clicking the padding, the gap
				// between items, or the border fired `select` with nothing selected, leaving every
				// consumer to work out from the event whether an item had actually been hit.
				const item = event.target?.closest?.('li');
				if (!item || !this.elem.contains(item) || item.getAttribute('role') === 'presentation') return;

				this.emit('select', event);
			},
		});

		this.on({
			targetEvent: 'keydown',
			callback: e => {
				const items = itemsOf(this.elem);
				if (!items.length) return;

				const currentIndex = items.indexOf(document.activeElement);
				let next = null;

				if (e.key === 'ArrowDown') {
					e.preventDefault();
					next = items[(currentIndex + 1) % items.length];
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					next = items[(currentIndex - 1 + items.length) % items.length];
				} else if (e.key === 'Home') {
					e.preventDefault();
					next = items[0];
				} else if (e.key === 'End') {
					e.preventDefault();
					next = items[items.length - 1];
				} else if ((e.key === 'Enter' || e.key === ' ') && currentIndex >= 0) {
					// The keyboard presses the item, so its own handler runs and select comes from the one click path
					e.preventDefault();
					items[currentIndex].click();
					return;
				}

				if (next) {
					items.forEach(item => item.setAttribute('tabindex', '-1'));
					next.setAttribute('tabindex', '0');
					next.focus();
				}
			},
		});
	}
}
