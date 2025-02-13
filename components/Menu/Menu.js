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

export default class Menu extends StyledList {
	constructor(options = {}, ...children) {
		super({ ...options, onPointerPress: options.onSelect }, children);
	}
}
