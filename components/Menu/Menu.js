import { styled } from '../../styled';
import { List } from '../List';

const StyledList = styled(
	List,
	({ colors }) => `
		margin: 0;
		padding: 0;
		list-style: none;

		& li {
			cursor: pointer;
			padding: 6px 6px 9px 6px;
			border-bottom: 1px solid ${colors.light(colors.gray)};

			&:last-of-type, &:last-of-type > a {
				border-bottom: none !important;
			}

			&:hover, &:focus, &:focus-visible, & a:hover, & a:focus, & a:focus-visible  {
				color: ${colors.light(colors.blue)} !important;
				border-color: ${colors.light(colors.blue)};
			}

			&:focus-visible, & a:focus-visible {
				outline: 2px solid ${colors.light(colors.blue)};
				outline-offset: -2px;
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
 * @param {Function} [options.onSelect] - Handler called when menu item is selected
 * @param {Component} [options.ListItemComponent] - Custom component class for rendering menu items
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Menu} Menu component instance
 */
export default class Menu extends StyledList {
	static handlers = {
		items(value, next) {
			next(value);
			if (!value) return;
			const items = Array.from(this.elem.children).filter(el => el.tagName === 'LI');
			items.forEach((li, i) => li.setAttribute('tabindex', i === 0 ? '0' : '-1'));
		},
	};

	constructor(options = {}, ...children) {
		super({ role: 'menu', ...options, onPointerPress: options.onSelect }, ...children);

		this.on({
			targetEvent: 'keydown',
			callback: e => {
				const items = Array.from(this.elem.children).filter(el => el.tagName === 'LI');
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
					e.preventDefault();
					this.options.onSelect?.(e);
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
