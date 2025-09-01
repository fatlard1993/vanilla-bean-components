import { styled } from '../../styled';
import { List } from '../List';

const StyledList = styled(
	List,
	({ colors }) => `
		margin: 0;
		padding: 0;
		list-style: none;

		li {
			cursor: pointer;
			padding: 6px 6px 9px 6px;
			border-bottom: 1px solid ${colors.light(colors.gray)};

			&:last-of-type, &:last-of-type > a {
				border-bottom: none !important;
			}

			&:hover, &:focus, &:focus-visible, a:hover, a:focus, a:focus-visible  {
				outline: none;
				color: ${colors.light(colors.blue)} !important;
				border-color: ${colors.light(colors.blue)};
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
	constructor(options = {}, ...children) {
		super({ ...options, onPointerPress: options.onSelect }, children);
	}
}
